from pydantic import BaseModel
from typing import Optional

class Track(BaseModel):
    id: str
    title: str
    artist: str
    album: Optional[str] = None
    coverArt: Optional[str] = None
    duration: float
    source: str

class LyricLine(BaseModel):
    time: float
    text: str
    isInstrumental: bool = False

class LyricsMeta(BaseModel):
    provider: str
    copyright: Optional[str] = None

class LyricsResponse(BaseModel):
    trackId: str
    type: str  # "synced" or "static"
    lyrics: list[LyricLine]
    meta: LyricsMeta

class SearchResponse(BaseModel):
    results: list[Track]

class StreamResponse(BaseModel):
    url: str
    duration: Optional[float] = None

class ErrorResponse(BaseModel):
    error: str
    code: str