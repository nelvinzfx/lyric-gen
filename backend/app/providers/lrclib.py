import httpx
import re
from typing import Optional
from ..models import Track, LyricLine, LyricsResponse, LyricsMeta

BASE_URL = "https://lrclib.net/api"

async def search(query: str) -> list[Track]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/search", params={"q": query}, timeout=10)
        if resp.status_code != 200:
            return []
        
        results = []
        for item in resp.json()[:10]:
            results.append(Track(
                id=f"lrclib_{item.get('id', '')}",
                title=item.get("trackName", "Unknown"),
                artist=item.get("artistName", "Unknown"),
                album=item.get("albumName"),
                coverArt=None,
                duration=item.get("duration", 0),
                source="lrclib"
            ))
        return results

def _parse_lrc(lrc: str) -> list[LyricLine]:
    """Parse LRC format to list of LyricLine"""
    lines = []
    pattern = r'\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)' 
    
    for line in lrc.strip().split('\n'):
        match = re.match(pattern, line)
        if match:
            mins, secs, ms, text = match.groups()
            ms = ms.ljust(3, '0')[:3]
            time = int(mins) * 60 + int(secs) + int(ms) / 1000
            text = text.strip()
            is_instrumental = text == "" or text.lower() in ["♪", "instrumental"]
            lines.append(LyricLine(
                time=round(time, 2),
                text=text if text else "♪",
                isInstrumental=is_instrumental
            ))
    
    return lines

async def get_lyrics(track_id: str) -> Optional[LyricsResponse]:
    """Get lyrics by lrclib track ID"""
    lrclib_id = track_id.replace("lrclib_", "")
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/get/{lrclib_id}", timeout=10)
        if resp.status_code != 200:
            return None
        
        data = resp.json()
        synced = data.get("syncedLyrics")
        plain = data.get("plainLyrics")
        
        if synced:
            lyrics = _parse_lrc(synced)
            lyric_type = "synced"
        elif plain:
            lyrics = [LyricLine(time=-1, text=line.strip()) for line in plain.split('\n') if line.strip()]
            lyric_type = "static"
        else:
            return None
        
        return LyricsResponse(
            trackId=track_id,
            type=lyric_type,
            lyrics=lyrics,
            meta=LyricsMeta(provider="lrclib")
        )

async def get_lyrics_by_query(artist: str, title: str) -> Optional[LyricsResponse]:
    """Direct lookup by artist + title"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/get", params={
            "artist_name": artist,
            "track_name": title
        }, timeout=10)
        
        if resp.status_code != 200:
            return None
        
        data = resp.json()
        track_id = f"lrclib_{data.get('id', 'unknown')}"
        synced = data.get("syncedLyrics")
        plain = data.get("plainLyrics")
        
        if synced:
            lyrics = _parse_lrc(synced)
            lyric_type = "synced"
        elif plain:
            lyrics = [LyricLine(time=-1, text=line.strip()) for line in plain.split('\n') if line.strip()]
            lyric_type = "static"
        else:
            return None
        
        return LyricsResponse(
            trackId=track_id,
            type=lyric_type,
            lyrics=lyrics,
            meta=LyricsMeta(provider="lrclib")
        )
