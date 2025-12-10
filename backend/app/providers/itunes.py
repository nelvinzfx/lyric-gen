import httpx
import asyncio
from typing import List, Optional
from ..models import Track

BASE_URL = "https://itunes.apple.com/search"

async def search(query: str, limit: int = 20) -> List[Track]:
    params = {
        "term": query,
        "entity": "song",
        "limit": limit,
        "media": "music"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(BASE_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            tracks = []
            for item in data.get("results", []):
                # iTunes creates 100x100 images by default. Let's hack it to get 600x600 for high quality
                artwork_url = item.get("artworkUrl100", "").replace("100x100bb", "600x600bb")
                
                tracks.append(Track(
                    id=f"itunes_{item.get('trackId')}",
                    title=item.get("trackName"),
                    artist=item.get("artistName"),
                    album=item.get("collectionName"),
                    coverArt=artwork_url,
                    duration=item.get("trackTimeMillis", 0) / 1000,
                    source="itunes"
                ))
            return tracks
        except Exception as e:
            print(f"iTunes API Error: {e}")
            return []
