from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.routing import APIRouter
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional
from pydantic import BaseModel
import httpx
import os

from .models import SearchResponse, LyricsResponse, ErrorResponse
from .providers import lrclib, ytmusic, youtube
from . import cache

# Static directory for SPA
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
SPA_ENABLED = os.path.exists(STATIC_DIR)
MAINTENANCE_MODE = os.getenv("MAINTENANCE_MODE", "false").lower() == "true"

app = FastAPI(title="SonicScript API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Maintenance mode middleware
@app.middleware("http")
async def maintenance_middleware(request: Request, call_next):
    if MAINTENANCE_MODE and not request.url.path == "/health":
        from fastapi.responses import JSONResponse
        return JSONResponse(
            {"maintenance": True, "message": "Site is under maintenance. Please check back soon!"},
            status_code=503
        )
    return await call_next(request)

class StreamResponse(BaseModel):
    url: str
    duration: Optional[float] = None

# ============ API ROUTER ============
api_router = APIRouter(prefix="/api/v1")

@api_router.get("/search", response_model=SearchResponse)
async def search(q: str = Query(..., min_length=1)):
    cached = cache.get("search", q)
    if cached:
        return SearchResponse(results=cached)
    results = await ytmusic.search(q)
    cache.set("search", q, [r.model_dump() for r in results])
    return SearchResponse(results=results)

@api_router.get("/recommendations", response_model=SearchResponse)
async def recommendations():
    cached = cache.get("recommendations", "home")
    if cached:
        return SearchResponse(results=cached)
    results = await ytmusic.get_recommendations(limit=20)
    cache.set("recommendations", "home", [r.model_dump() for r in results], ttl=3600)
    return SearchResponse(results=results)

@api_router.get("/lyrics", response_model=LyricsResponse, responses={404: {"model": ErrorResponse}})
async def get_lyrics(
    trackId: Optional[str] = None,
    query: Optional[str] = None,
    artist: Optional[str] = None,
    title: Optional[str] = None
):
    cache_key = f"{artist}:{title}" if artist and title else (trackId or query)
    cached = cache.get("lyrics", cache_key)
    if cached:
        return LyricsResponse(**cached)
    
    result = None
    if artist and title:
        result = await lrclib.get_lyrics_by_query(artist, title)
    elif trackId and trackId.startswith("lrclib_"):
        result = await lrclib.get_lyrics(trackId)
    elif query:
        result = await lrclib.get_lyrics_by_query("", query)
    
    if not result:
        raise HTTPException(status_code=404, detail={"error": "Lyrics not found", "code": "LYRICS_NOT_FOUND"})
    
    cache.set("lyrics", cache_key, result.model_dump())
    return result

@api_router.get("/stream", response_model=StreamResponse, responses={404: {"model": ErrorResponse}})
async def get_stream(
    request: Request,
    artist: Optional[str] = None,
    title: Optional[str] = None,
    videoId: Optional[str] = None
):
    if videoId:
        vid = videoId.replace("ytm_", "")
    else:
        results = await ytmusic.search(f"{artist} {title}", limit=1)
        if not results:
            raise HTTPException(status_code=404, detail={"error": "Track not found", "code": "TRACK_NOT_FOUND"})
        vid = results[0].id.replace("ytm_", "")
    
    # Build proxy URL with correct scheme (respect X-Forwarded-Proto from reverse proxy)
    scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host", request.url.netloc)
    proxy_url = f"{scheme}://{host}/api/v1/audio/{vid}"
    
    # Get duration from cache or fetch
    cache_key = f"duration_{vid}"
    duration = cache.get("duration", vid)
    if not duration:
        info = await youtube.get_stream_url(vid)
        if info:
            duration = info.get("duration")
            cache.set("duration", vid, duration, ttl=86400)
    
    return StreamResponse(url=proxy_url, duration=duration)

@api_router.get("/audio/{video_id}")
async def proxy_audio(video_id: str, request: Request):
    """Proxy audio stream from YouTube to bypass CORS/IP restrictions"""
    cache_key = f"yt_url_{video_id}"
    yt_url = cache.get("yt_url", video_id)
    
    if not yt_url:
        info = await youtube.get_stream_url(video_id)
        if not info or not info.get("url"):
            raise HTTPException(status_code=404, detail="Audio not found")
        yt_url = info["url"]
        cache.set("yt_url", video_id, yt_url, ttl=3600)
    
    # Forward range header if present
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    range_header = request.headers.get("range")
    if range_header:
        headers["Range"] = range_header
    
    async with httpx.AsyncClient() as client:
        yt_response = await client.get(yt_url, headers=headers)
        
        response_headers = {
            "Accept-Ranges": "bytes",
            "Content-Type": yt_response.headers.get("Content-Type", "audio/webm"),
        }
        
        if "Content-Length" in yt_response.headers:
            response_headers["Content-Length"] = yt_response.headers["Content-Length"]
        if "Content-Range" in yt_response.headers:
            response_headers["Content-Range"] = yt_response.headers["Content-Range"]
        
        return StreamingResponse(
            iter([yt_response.content]),
            status_code=yt_response.status_code,
            headers=response_headers,
            media_type=response_headers["Content-Type"]
        )

# Include API router FIRST
app.include_router(api_router)

@app.get("/health")
async def health():
    return {"status": "ok"}

# ============ SPA MIDDLEWARE ============
# Handle SPA routing via middleware to ensure API routes are never intercepted

if SPA_ENABLED:
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    
    class SPAMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: Request, call_next):
            response = await call_next(request)
            
            # If we got a 404 and it's NOT an API route, serve index.html
            if response.status_code == 404:
                path = request.url.path
                if not path.startswith("/api/") and not path.startswith("/health") and not path.startswith("/assets") and not path.startswith("/docs") and not path.startswith("/openapi"):
                    return FileResponse(os.path.join(STATIC_DIR, "index.html"))
            
            return response
    
    app.add_middleware(SPAMiddleware)
    
    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
