export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverArt?: string | null;
  duration?: number;
  source?: string;
}

export interface LyricLine {
  time: number;
  text: string;
  isInstrumental?: boolean;
}

export interface LyricsResponse {
  trackId: string;
  type: 'synced' | 'static';
  lyrics: LyricLine[];
  meta?: {
    provider?: string;
    copyright?: string | null;
  };
}

export interface SearchResponse {
  results: Track[];
}

export interface AppState {
  currentTrack: Track | null;
  lyrics: LyricLine[];
  lyricsType: 'synced' | 'static' | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
  
  // Settings
  lyricFontSize: number;
  customBackground: string | null;
  isBackgroundBlurred: boolean;

  setTrack: (track: Track) => void;
  setLyrics: (lyrics: LyricLine[], type: 'synced' | 'static' | null) => void;
  setPlaybackState: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Settings Setters
  setLyricFontSize: (size: number) => void;
  setCustomBackground: (url: string | null) => void;
  setIsBackgroundBlurred: (isBlurred: boolean) => void;
  
  reset: () => void;
}
