from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional
from pydantic import BaseModel
import httpx
import os

from .models import SearchResponse, LyricsResponse, ErrorResponse
from .providers import lrclib, ytmusic, youtube
from . import cache

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

@app.get("/api/v1/search", response_model=SearchResponse)
async def search(q: str = Query(..., min_length=1)):
    """Search for tracks using YouTube Music"""
    cached = cache.get("search", q)
    if cached:
        return SearchResponse(results=cached)
    
    results = await ytmusic.search(q)
    cache.set("search", q, [r.model_dump() for r in results])
    
    return SearchResponse(results=results)

@app.get("/api/v1/recommendations", response_model=SearchResponse)
async def recommendations():
    """Get recommended/trending songs"""
    cached = cache.get("recommendations", "home")
    if cached:
        return SearchResponse(results=cached)
    
    results = await ytmusic.get_recommendations(limit=20)
    cache.set("recommendations", "home", [r.model_dump() for r in results], ttl=3600)
    
    return SearchResponse(results=results)

@app.get("/api/v1/lyrics", response_model=LyricsResponse, responses={404: {"model": ErrorResponse}})
async def get_lyrics(
    trackId: Optional[str] = None,
    query: Optional[str] = None,
    artist: Optional[str] = None,
    title: Optional[str] = None
):
    """Get lyrics for a track"""
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
        raise HTTPException(status_code=404, detail={
            "error": "Lyrics not found",
            "code": "LYRICS_NOT_FOUND"
        })
    
    cache.set("lyrics", cache_key, result.model_dump())
    return result

@app.get("/api/v1/stream", response_model=StreamResponse, responses={404: {"model": ErrorResponse}})
async def get_stream(
    artist: Optional[str] = None,
    title: Optional[str] = None,
    videoId: Optional[str] = None
):
    """Get audio stream URL from YouTube"""
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
        raise HTTPException(status_code=404, detail={
            "error": "Audio stream not found",
            "code": "STREAM_NOT_FOUND"
        })
    
    result = {
        "url": info["url"],
        "duration": info.get("duration")
    }
    
    cache.set("stream", cache_key, result, ttl=7200)
    return StreamResponse(**result)

@app.get("/health")
async def health():
    return {"status": "ok"}

# Serve React App (Production/Docker)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    # Mount static files for assets
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    
    # SPA catch-all - must be last and exclude API paths
    from starlette.routing import Mount, Route
    from starlette.responses import FileResponse as StarletteFileResponse
    
    async def spa_handler(request):
        path = request.path_params.get("path", "")
        
        # Let API routes pass through (they're already handled above)
        if path.startswith("api/") or path == "health":
            from starlette.responses import Response
            return Response(status_code=404)
        
        # Try to serve static file
        file_path = os.path.join(static_dir, path)
        if path and os.path.isfile(file_path):
            return StarletteFileResponse(file_path)
        
        # SPA fallback
        return StarletteFileResponse(os.path.join(static_dir, "index.html"))
    
    # Add catch-all at the very end of routes
    app.routes.append(Route("/{path:path}", spa_handler, methods=["GET"]))
    app.routes.append(Route("/", spa_handler, methods=["GET"]))
