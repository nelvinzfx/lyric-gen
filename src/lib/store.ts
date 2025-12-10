import { create } from 'zustand';
import { Track, LyricLine } from './types';

interface AppState {
  currentTrack: Track | null;
  streamUrl: string | null;
  lyrics: LyricLine[];
  lyricsType: 'synced' | 'static' | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
  lyricFontSize: number;
  customBackground: string | null;
  isBackgroundBlurred: boolean;
  isLyricClickToSeek: boolean;
  seekRequest: number | null;
  theme: 'obsidian' | 'midnight' | 'sunset';
  isVisualizerEnabled: boolean;
  setIsVisualizerEnabled: (enabled: boolean) => void;
  analyser: AnalyserNode | null;
  setAnalyser: (node: AnalyserNode | null) => void;
  lyricStyle: 'classic' | 'kinetic' | 'drill' | 'story';
  setLyricStyle: (style: 'classic' | 'kinetic' | 'drill' | 'story') => void;
  lyricCasing: 'original' | 'uppercase' | 'lowercase';
  setLyricCasing: (casing: 'original' | 'uppercase' | 'lowercase') => void;
  lastSearchQuery: string;
  lastSearchResults: Track[];

  setTrack: (track: Track) => void;
  setStreamUrl: (url: string | null) => void;
  setLyrics: (lyrics: LyricLine[], type: 'synced' | 'static' | null) => void;
  setPlaybackState: (isPlaying: boolean) => void;
  setLyricFontSize: (size: number) => void;
  setCustomBackground: (url: string | null) => void;
  setIsBackgroundBlurred: (isBlurred: boolean) => void;
  setIsLyricClickToSeek: (enabled: boolean) => void;
  requestSeek: (time: number | null) => void;
  setTheme: (theme: 'obsidian' | 'midnight' | 'sunset') => void;
  setLastSearch: (query: string, results: Track[]) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentTrack: null,
  streamUrl: null,
  lyrics: [],
  lyricsType: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1.0,
  isLoading: false,
  error: null,
  lyricFontSize: 24,
  customBackground: null,
  isBackgroundBlurred: true,
  isLyricClickToSeek: true,
  seekRequest: null,
  theme: 'obsidian',
  lastSearchQuery: "",
  lastSearchResults: [],

  setTrack: (track) => set({ currentTrack: track, error: null }),
  setStreamUrl: (url) => set({ streamUrl: url }),
  setLyrics: (lyrics, type) => set({ lyrics, lyricsType: type }),
  setPlaybackState: (isPlaying) => set({ isPlaying }),
  setLyricFontSize: (size) => set({ lyricFontSize: size }),
  setCustomBackground: (url) => set({ customBackground: url }),
  setIsBackgroundBlurred: (isBlurred) => set({ isBackgroundBlurred: isBlurred }),
  setIsLyricClickToSeek: (enabled) => set({ isLyricClickToSeek: enabled }),
  requestSeek: (time) => set({ seekRequest: time }),
  setTheme: (theme) => set({ theme }),
  setIsVisualizerEnabled: (enabled) => set({ isVisualizerEnabled: enabled }),
  analyser: null,
  setAnalyser: (node) => set({ analyser: node }),
  lyricStyle: 'kinetic',
  setLyricStyle: (style) => set({ lyricStyle: style }),
  lyricCasing: 'original',
  setLyricCasing: (casing) => set({ lyricCasing: casing }),
  setLastSearch: (query, results) => set({ lastSearchQuery: query, lastSearchResults: results }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({
    currentTrack: null,
    streamUrl: null,
    lyrics: [],
    lyricsType: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    error: null
  }),
}));
