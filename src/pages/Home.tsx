import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Music, Disc, Loader2, Sparkles, Zap, Aperture } from "lucide-react";
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
    <main className="flex h-screen flex-col items-center bg-black text-white overflow-hidden relative font-sans selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <motion.div 
        animate={{ 
          opacity: [0.2, 0.4, 0.2], 
          scale: [1, 1.2, 1],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-violet-900/20 blur-[180px] rounded-full pointer-events-none z-0 mix-blend-screen" 
      />
       <motion.div 
        animate={{ 
          opacity: [0.1, 0.3, 0.1], 
          scale: [1.2, 1, 1.2],
          rotate: [0, -10, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none z-0 mix-blend-screen" 
      />
      
      <div className="z-10 w-full max-w-7xl flex flex-col h-full px-6 md:px-12 pt-12 md:pt-20 gap-12">
        
        {/* Hero & Search Section */}
        <div className="flex flex-col gap-10 shrink-0 items-center md:items-start text-center md:text-left">
          <div className="space-y-4 flex flex-col items-center md:items-start">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 leading-[0.9]"
            >
              LYRIC<br/>GEN
            </motion.h1>

             <motion.div
               initial="hidden"
               animate="visible"
               variants={{
                 visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } }
               }}
               className="flex items-center justify-center md:justify-start overflow-hidden"
             >
                {Array.from("EXPERIENCE MUSIC").map((char, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, x: -10, filter: "blur(4px)" },
                      visible: { 
                        opacity: 1, 
                        x: 0, 
                        filter: "blur(0px)",
                        transition: { type: "spring", stiffness: 200, damping: 20 }
                      }
                    }}
                    className="text-base font-mono font-medium text-white/50 inline-block"
                    style={{ marginRight: char === " " ? "0.5em" : "0.5em" }} // Manual tracking via margin
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
             </motion.div>
          </div>

          {/* Search Input (Minimalist Style) */}
          <motion.div 
            initial={{ opacity: 0, width: "95%" }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={cn(
              "relative group transition-all duration-500 ease-out",
              isFocused ? "max-w-4xl" : "max-w-2xl"
            )}
          >
            <div className="relative flex items-center gap-6 py-4">
              <Search className={cn("transition-colors duration-300", isFocused ? "text-violet-400" : "text-white/40 group-hover:text-white/70")} size={28} />
              
              <input 
                type="text" 
                placeholder="Search artists, tracks, or vibes..." 
                className="bg-transparent border-none outline-none text-white text-3xl w-full placeholder-white/20 font-light tracking-wide"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
              />
              
              {isSearching && <Loader2 className="animate-spin text-white/50" size={24} />}

              {/* Minimalist Border System */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 group-hover:bg-white/30 transition-colors duration-500" />
              
              <motion.div 
                className="absolute bottom-0 h-[2px] bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                initial={{ width: "0%" }}
                animate={{ width: isFocused ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                style={{ left: "50%", translateX: "-50%" }}
              />
            </div>
          </motion.div>
        </div>

        {/* Filters / Engine Tags */}
        {!query && !results.length && !recommendations.length && (
           <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4 justify-center md:justify-start flex-wrap"
           >
              <EngineTag icon={Aperture} label="Story Mode" delay={0.1} />
              <EngineTag icon={Zap} label="Drill Mode" delay={0.2} />
              <EngineTag icon={Sparkles} label="Kinetic Mode" delay={0.3} />
           </motion.div>
        )}

        {/* Results Grid */}
        <div className="flex-1 w-full overflow-y-auto no-scrollbar pb-32 mask-image-gradient-vertical">
          <AnimatePresence mode="wait">
            {results.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full pt-4"
              >
                {results.map((track, i) => (
                  <ResultCard key={track.id} track={track} index={i} onClick={() => handleSelectTrack(track)} />
                ))}
              </motion.div>
            ) : query.length > 0 && !isSearching ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-white/20 gap-6"
              >
                <Disc size={80} strokeWidth={0.5} className="animate-pulse" />
                <p className="font-light tracking-[0.2em] uppercase text-sm">No Signal Found</p>
              </motion.div>
            ) : !query && recommendations.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-8"
              >
                <div className="flex items-center gap-3 mb-8 text-white/40 border-b border-white/5 pb-4">
                  <Sparkles size={16} className="text-violet-400" />
                  <span className="text-xs font-mono uppercase tracking-widest">Suggested for you</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
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

function EngineTag({ icon: Icon, label, delay }: { icon: any, label: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + delay }}
      className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-white/40 text-xs uppercase tracking-wider font-medium hover:bg-white/10 hover:text-white transition-colors cursor-default"
    >
      <Icon size={14} />
      {label}
    </motion.div>
  )
}

function ResultCard({ track, index, onClick }: { track: Track; index: number; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-4"
    >
      {/* Image Container */}
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-[#111] relative shadow-lg group-hover:shadow-violet-900/20 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
            <Music size={20} fill="currentColor" />
          </div>
        </div>
        
        {track.coverArt && !imgError ? (
          <img 
            src={track.coverArt} 
            alt={track.title} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[30%] group-hover:grayscale-0"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 bg-neutral-900">
            <Music size={32} />
          </div>
        )}
      </div>

      {/* Text Meta */}
      <div className="flex flex-col gap-1.5 px-1">
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 group-hover:text-violet-400 transition-colors">{track.title}</h3>
        <p className="text-white/40 text-sm line-clamp-1 font-medium group-hover:text-white/60 transition-colors">{track.artist}</p>
      </div>
    </motion.div>
  );
}