import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Music, Disc, Loader2, TrendingUp } from "lucide-react";
import { searchTracks, getRecommendations } from "@/lib/api";
import { Track } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import PlayerControls from "@/components/PlayerControls";

export default function Home() {
  const { lastSearchQuery, lastSearchResults, setLastSearch, currentTrack, streamUrl } = useAppStore();
  const [query, setQuery] = useState(lastSearchQuery || "");
  const [results, setResults] = useState<Track[]>(lastSearchResults || []);
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(lastSearchQuery || "");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Load recommendations on mount
  useEffect(() => {
    const loadRecs = async () => {
      setIsLoadingRecs(true);
      try {
        const data = await getRecommendations();
        setRecommendations(data.results);
      } catch (e) {
        console.error("Failed to load recommendations", e);
      } finally {
        setIsLoadingRecs(false);
      }
    };
    loadRecs();
  }, []);

  // Restore state on mount
  useEffect(() => {
    if (lastSearchResults.length > 0 && results.length === 0) {
      setResults(lastSearchResults);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery === lastSearchQuery) {
      if (!debouncedQuery.trim()) setResults([]);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const data = await searchTracks(debouncedQuery);
        setResults(data.results);
        setLastSearch(debouncedQuery, data.results);
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleSelectTrack = (track: Track) => {
    const params = new URLSearchParams({
      q: `${track.artist} ${track.title}`,
      trackId: track.id,
      cover: track.coverArt || "",
      title: track.title,
      artist: track.artist
    });
    navigate(`/player?${params.toString()}`);
  };

  return (
    <main className="flex h-screen flex-col items-center bg-[#030303] text-white overflow-hidden relative font-sans">
      {/* Deep Ambient Background */}
      <motion.div 
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-900/20 blur-[150px] rounded-full pointer-events-none z-0" 
      />
      
      <div className="z-10 w-full max-w-6xl flex flex-col h-full px-6 pt-16 gap-12">
        
        {/* Hero & Search Section */}
        <div className="flex flex-col gap-8 shrink-0">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 leading-[0.9]"
          >
            SONIC<br/>SCRIPT
          </motion.h1>

          {/* Minimalist Search Input */}
          <motion.div 
            initial={{ opacity: 0, width: "90%" }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={cn(
              "relative group transition-all duration-500 ease-out",
              isFocused ? "max-w-3xl scale-105" : "max-w-xl hover:scale-102"
            )}
          >
            <div className="relative flex items-center gap-4 py-4">
              <Search className={cn("transition-colors duration-300", isFocused ? "text-white" : "text-white/40 group-hover:text-white/70")} size={24} />
              
              <input 
                type="text" 
                placeholder="Search your vibe..." 
                className="bg-transparent border-none outline-none text-white text-2xl w-full placeholder-white/20 font-light tracking-wide"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
              />
              
              {isSearching && <Loader2 className="animate-spin text-white/50" size={20} />}

              {/* Minimalist Border System */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 group-hover:bg-white/30 transition-colors duration-500" />
              
              <motion.div 
                className="absolute bottom-0 h-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: isFocused ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                style={{ left: "50%", translateX: "-50%" }}
              />
            </div>
          </motion.div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 w-full overflow-y-auto no-scrollbar pb-20">
          <AnimatePresence mode="wait">
            {results.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10 w-full"
              >
                {results.map((track, i) => (
                  <ResultCard key={track.id} track={track} index={i} onClick={() => handleSelectTrack(track)} />
                ))}
              </motion.div>
            ) : query.length > 0 && !isSearching ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-white/20 gap-4"
              >
                <Disc size={64} strokeWidth={1} />
                <p className="font-light tracking-widest uppercase text-sm">Silence</p>
              </motion.div>
            ) : !query && recommendations.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-6 text-white/50">
                  <TrendingUp size={18} />
                  <span className="text-sm font-medium tracking-wide">Trending Now</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-10 w-full">
                  {recommendations.map((track, i) => (
                    <ResultCard key={track.id} track={track} index={i} onClick={() => handleSelectTrack(track)} />
                  ))}
                </div>
              </motion.div>
            ) : isLoadingRecs ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="h-40 flex items-center justify-center"
              >
                <Loader2 className="animate-spin text-white/30" size={32} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Mini Player when track is active */}
      {currentTrack && <PlayerControls src={streamUrl || undefined} />}
    </main>
  );
}

function ResultCard({ track, index, onClick }: { track: Track; index: number; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-4"
    >
      {/* Image Container */}
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-[#111] relative">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        {track.coverArt && !imgError ? (
          <img 
            src={track.coverArt} 
            alt={track.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <Music size={32} />
          </div>
        )}
      </div>

      {/* Text Meta */}
      <div className="flex flex-col gap-1">
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 group-hover:text-indigo-400 transition-colors">{track.title}</h3>
        {track.album && (
          <span className="inline-block w-fit text-white/30 text-[10px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded line-clamp-1">{track.album}</span>
        )}
        <p className="text-white/40 text-sm line-clamp-1 group-hover:text-white/60 transition-colors">{track.artist}</p>
      </div>
    </motion.div>
  );
}
