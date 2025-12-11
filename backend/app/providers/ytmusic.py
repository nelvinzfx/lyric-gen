from ytmusicapi import YTMusic
from typing import List, Optional
from ..models import Track

ytm = YTMusic()

def _get_thumbnail(thumbnails: list, size: int = 544) -> str:
    """Get YT Music thumbnail resized to target size"""
    if not thumbnails:
        return ""
    
    best = max(thumbnails, key=lambda t: t.get("width", 0))
    url = best.get("url", "")
    
    if url and "=w" in url:
        return url.split("=w")[0] + f"=w{size}-h{size}-l90-rj"
    
    return url

def _parse_duration(duration_str: str) -> float:
    if not duration_str:
        return 0
    parts = duration_str.split(':')
    try:
        if len(parts) == 2:
            return int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    except:
        pass
    return 0

async def search(query: str, limit: int = 20) -> List[Track]:
    """Search YouTube Music for songs"""
    try:
        results = ytm.search(query, filter="songs", limit=limit)
        tracks = []
        
        for item in results:
            if item.get("resultType") != "song":
                continue
            
            video_id = item.get("videoId")
            if not video_id:
                continue
            
            artists = item.get("artists", [])
            artist_name = artists[0].get("name", "Unknown") if artists else "Unknown"
            
            album_info = item.get("album")
            album_name = album_info.get("name") if album_info else None
            
            thumbnails = item.get("thumbnails", [])
            
            duration = _parse_duration(item.get("duration", ""))
            if not duration:
                duration = item.get("duration_seconds", 0)
            
            tracks.append(Track(
                id=f"ytm_{video_id}",
                title=item.get("title", "Unknown"),
                artist=artist_name,
                album=album_name,
                coverArt=_get_thumbnail(thumbnails, 544),
                duration=float(duration),
                source="ytmusic"
            ))
        
        return tracks
    except Exception as e:
        print(f"YTMusic search error: {e}")
        return []

async def get_recommendations(limit: int = 20) -> List[Track]:
    """Get recommended/trending songs from YouTube Music home"""
    try:
        home = ytm.get_home(limit=5)
        tracks = []
        
        for section in home:
            contents = section.get("contents", [])
            for item in contents:
                # Only process songs/videos with videoId
                video_id = item.get("videoId")
                if not video_id:
                    continue
                
                artists = item.get("artists", [])
                artist_name = artists[0].get("name", "Unknown") if artists else "Unknown"
                
                album_info = item.get("album")
                album_name = album_info.get("name") if album_info else None
                
                thumbnails = item.get("thumbnails", [])
                
                tracks.append(Track(
                    id=f"ytm_{video_id}",
                    title=item.get("title", "Unknown"),
                    artist=artist_name,
                    album=album_name,
                    coverArt=_get_thumbnail(thumbnails, 544),
                    duration=0,
                    source="ytmusic"
                ))
                
                if len(tracks) >= limit:
                    break
            
            if len(tracks) >= limit:
                break
        
        return tracks
    except Exception as e:
        print(f"YTMusic recommendations error: {e}")
        return []

async def get_track(video_id: str) -> Optional[Track]:
    """Get single track info by video ID"""
    try:
        vid = video_id.replace("ytm_", "")
        info = ytm.get_song(vid)
        
        if not info:
            return None
        
        details = info.get("videoDetails", {})
        thumbnails = details.get("thumbnail", {}).get("thumbnails", [])
        
        return Track(
            id=f"ytm_{vid}",
            title=details.get("title", "Unknown"),
            artist=details.get("author", "Unknown"),
            album=None,
            coverArt=_get_thumbnail(thumbnails, 544),
            duration=float(details.get("lengthSeconds", 0)),
            source="ytmusic"
        )
    except Exception as e:
        print(f"YTMusic get_track error: {e}")
        return None

async def get_stream_url(video_id: str) -> Optional[dict]:
    """Get audio stream URL directly from YouTube Music API"""
    try:
        vid = video_id.replace("ytm_", "")
        info = ytm.get_song(vid)
        
        if not info:
            return None
        
        # Get streaming data
        streaming = info.get("streamingData", {})
        formats = streaming.get("adaptiveFormats", []) or streaming.get("formats", [])
        
        # Find best audio format
        audio_url = None
        for fmt in formats:
            mime = fmt.get("mimeType", "")
            if "audio" in mime:
                audio_url = fmt.get("url")
                if audio_url:
                    break
        
        if not audio_url:
            # Fallback to any format
            for fmt in formats:
                if fmt.get("url"):
                    audio_url = fmt["url"]
                    break
        
        duration = info.get("videoDetails", {}).get("lengthSeconds", 0)
        
        return {
            "url": audio_url,
            "duration": float(duration) if duration else None
        }
    except Exception as e:
        print(f"YTMusic get_stream error: {e}")
        return None
