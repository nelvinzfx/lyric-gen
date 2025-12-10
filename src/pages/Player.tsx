import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, SlidersHorizontal, Maximize2, Minimize2, AlertCircle, Loader2, Music } from "lucide-react";
import { getLyrics, getStreamUrl } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Track } from "@/lib/types";
import LyricDisplay from "@/components/LyricDisplay";
import PlayerControls from "@/components/PlayerControls";
import SettingsModal from "@/components/SettingsModal";
import { cn } from "@/lib/utils";

export default function Player() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const trackId = searchParams.get("trackId");
  const urlCover = searchParams.get("cover");
  const urlTitle = searchParams.get("title");
  const urlArtist = searchParams.get("artist");

  const {
    currentTrack, setTrack,
    streamUrl: globalStreamUrl, setStreamUrl: setGlobalStreamUrl,
    lyrics, setLyrics,
    currentTime,
    setLoading, setError, isLoading, error,
    lyricsType,
    customBackground, isBackgroundBlurred
  } = useAppStore();

  const [coverError, setCoverError] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Background Source Logic
  const activeBackground = customBackground || currentTrack?.coverArt;

  // Initialize track from URL params
  useEffect(() => {
    if (urlTitle && urlArtist) {
      // Check if same track already loaded
      if (currentTrack?.title === urlTitle && currentTrack?.artist === urlArtist) {
        return;
      }
      const track: Track = {
        id: trackId || "temp_id",
        title: urlTitle,
        artist: urlArtist,
        coverArt: urlCover || undefined
      };
      setTrack(track);
    }
  }, [urlTitle, urlArtist, urlCover, trackId, currentTrack]);

  // Fetch lyrics
  useEffect(() => {
    const fetchLyrics = async () => {
      if (!urlTitle || !urlArtist) return;
      // Skip if lyrics already loaded for this track
      if (lyrics.length > 0 && currentTrack?.title === urlTitle) return;

      setLoading(true);
      setError(null);
      
      try {
        const lyricsData = await getLyrics(undefined, undefined, urlArtist, urlTitle);
        setLyrics(lyricsData.lyrics, lyricsData.type);
      } catch (e) {
        console.error(e);
        setError("Lyrics unavailable");
        setLyrics([], null);
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [urlTitle, urlArtist]);

  // Fetch audio stream
  useEffect(() => {
    const fetchStream = async () => {
      if (!urlTitle || !urlArtist) return;
      // Skip if stream already loaded for this track
      if (globalStreamUrl && currentTrack?.title === urlTitle) return;

      setLoadingStream(true);
      
      try {
        const data = await getStreamUrl(trackId || undefined, urlArtist, urlTitle);
        setGlobalStreamUrl(data.url);
      } catch (e) {
        console.error("Stream error:", e);
      } finally {
        setLoadingStream(false);
      }
    };

    fetchStream();
  }, [urlTitle, urlArtist, trackId]);

  return (
    <main className="relative w-full h-screen text-white overflow-hidden flex flex-col font-sans">
      {/* Layer 0: Base Background (Solid) */}
      <div className="fixed inset-0 bg-[#020202] -z-20" />

      {/* Layer 1: Dynamic Background Image */}
      {activeBackground && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
           <div className="absolute inset-0 bg-black/60 z-10 transition-opacity duration-700" />
           <img
            src={activeBackground}
            alt="Background"
            className={cn(
              "w-full h-full object-cover transition-all duration-1000 ease-in-out",
              isBackgroundBlurred ? "blur-[80px] scale-125 opacity-60" : "blur-0 scale-100 opacity-40"
            )}
          />
        </div>
      )}

      {/* Layer 2: Main Content */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* Header */}
        <header className="flex justify-between items-center p-6 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md text-white/70 hover:text-white"
          >
            <ChevronDown size={20} />
          </button>
          
          <div className="absolute left-1/2 top-0 mt-8 -translate-x-1/2 text-center pointer-events-none z-0">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
              {isImmersive ? "Lyrics Mode" : "Now Playing"}
            </span>
          </div>

          <div className="relative z-10 flex gap-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md text-white/70 hover:text-white"
            >
              <SlidersHorizontal size={18} />
            </button>
            
            <button 
              onClick={() => setIsImmersive(!isImmersive)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all backdrop-blur-md ${isImmersive ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              {isImmersive ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto overflow-hidden pb-32 md:pb-24 px-6">
          
          <AnimatePresence mode="wait">
            {!isImmersive ? (
              /* DEFAULT MODE: ALBUM ART CENTERED */
              <motion.div 
                key="art-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="flex flex-col items-center justify-center w-full"
              >
                <div className="w-[280px] h-[280px] md:w-[450px] md:h-[450px] relative group">
                  {currentTrack?.coverArt && !coverError ? (
                     <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/10 relative z-10">
                       <img 
                         src={currentTrack.coverArt} 
                         className="w-full h-full object-cover" 
                         alt="Art"
                         onError={() => setCoverError(true)}
                       />
                     </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-2xl relative z-10 border border-white/10">
                      <div className="text-gray-600">
                        <Music size={80} />
                      </div>
                    </div>
                  )}
                  
                  {/* Glow behind art */}
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] -z-10 rounded-full scale-90 group-hover:scale-105 transition-transform duration-1000" />
                  
                  {loadingStream && (
                     <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-xs text-white/70 border border-white/10">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Loading audio...</span>
                        </div>
                     </div>
                  )}
                </div>
                
                <div className="mt-10 text-center space-y-2 max-w-full">
                  <h2 className="text-3xl md:text-4xl font-bold truncate tracking-tight w-full">{currentTrack?.title || "Loading..."}</h2>
                  <p className="text-gray-400 text-xl font-medium tracking-wide w-full truncate">{currentTrack?.artist || "..."}</p>
                </div>
              </motion.div>
            ) : (
              /* IMMERSIVE MODE: LYRICS CENTERED */
              <motion.div 
                key="lyrics-view"
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                {isLoading ? (
                   <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                   </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center text-white/30 gap-3">
                    <AlertCircle size={32} />
                    <p className="font-mono text-sm tracking-widest uppercase">Lyrics Unavailable</p>
                  </div>
                ) : (
                  <LyricDisplay
                    lyrics={lyrics}
                    currentTime={currentTime}
                    type={lyricsType}
                    isImmersive={true}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PlayerControls src={globalStreamUrl || undefined} />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </main>
  );
}