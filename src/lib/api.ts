import { SearchResponse, LyricsResponse } from './types';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '/api/v1');

export async function searchTracks(query: string): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getLyrics(
  trackId?: string,
  query?: string,
  artist?: string,
  title?: string
): Promise<LyricsResponse> {
  const params = new URLSearchParams();
  if (trackId) params.set('trackId', trackId);
  if (query) params.set('query', query);
  if (artist) params.set('artist', artist);
  if (title) params.set('title', title);

  const res = await fetch(`${API_BASE}/lyrics?${params.toString()}`);
  if (!res.ok) throw new Error('Lyrics not found');
  return res.json();
}

export async function getRecommendations(): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/recommendations`);
  if (!res.ok) throw new Error('Failed to get recommendations');
  return res.json();
}

export async function getStreamUrl(
  videoId?: string,
  artist?: string,
  title?: string
): Promise<{ url: string; duration?: number }> {
  const params = new URLSearchParams();
  if (videoId) params.set('videoId', videoId);
  if (artist) params.set('artist', artist);
  if (title) params.set('title', title);
  
  const res = await fetch(`${API_BASE}/stream?${params.toString()}`);
  if (!res.ok) throw new Error('Stream not found');
  return res.json();
}
