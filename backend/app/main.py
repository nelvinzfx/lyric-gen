from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.routing import APIRouter
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional
from pydantic import BaseModel
import os

from .models import SearchResponse, LyricsResponse, ErrorResponse
from .providers import lrclib, ytmusic, youtube
from . import cache

# Static directory for SPA
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
SPA_ENABLED = os.path.exists(STATIC_DIR)

app = FastAPI(title="SonicScript API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    artist: Optional[str] = None,
    title: Optional[str] = None,
    videoId: Optional[str] = None
):
    if videoId:
        video_id = videoId.replace("ytm_", "")
        cache_key = f"vid_{video_id}"
        query = f"https://www.youtube.com/watch?v={video_id}"
    else:
        cache_key = f"{artist} {title}"
        query = f"{artist} - {title}"
    
    cached = cache.get("stream", cache_key)
    if cached:
        return StreamResponse(**cached)
    
    info = await youtube.get_video_info(query)
    if not info or not info.get("url"):
        raise HTTPException(status_code=404, detail={"error": "Audio stream not found", "code": "STREAM_NOT_FOUND"})
    
    result = {"url": info["url"], "duration": info.get("duration")}
    cache.set("stream", cache_key, result, ttl=7200)
    return StreamResponse(**result)

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
