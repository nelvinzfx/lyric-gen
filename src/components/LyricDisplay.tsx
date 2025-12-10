import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LyricLine } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import LyricKinetic from "./LyricKinetic";
import LyricDrill from "./LyricDrill";
import LyricStory from "./LyricStory";

interface Props {
  lyrics: LyricLine[];
  currentTime: number;
  type: 'synced' | 'static' | null;
  isImmersive?: boolean;
}

export default function LyricDisplay({ lyrics, currentTime, type, isImmersive = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { lyricFontSize, isLyricClickToSeek, requestSeek, lyricStyle, lyricCasing } = useAppStore();

  const getProcessedText = (text: string) => {
    if (lyricCasing === 'uppercase') return text.toUpperCase();
    if (lyricCasing === 'lowercase') return text.toLowerCase();
    return text;
  };

  useEffect(() => {
    if (type !== 'synced') return;
    let index = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) index = i;
      else break;
    }
    setActiveIndex(index);
  }, [currentTime, lyrics, type]);

  useEffect(() => {
    // Scroll logic only for classic mode
    if (type !== 'synced' || !containerRef.current || lyricStyle === 'kinetic') return;
    const el = document.getElementById(`lyric-${activeIndex}`);
    if (el) {
      const container = containerRef.current;
      const containerHeight = container.clientHeight;
      const elTop = el.offsetTop;
      const elHeight = el.clientHeight;
      const scrollTo = elTop - (containerHeight / 2) + (elHeight / 2);
      
      container.scrollTo({
        top: scrollTo,
        behavior: "smooth"
      });
    }
  }, [activeIndex, type, lyricStyle]);

  if (!lyrics.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Searching Database...</p>
        </div>
      </div>
    );
  }

  // --- KINETIC STYLE RENDERER ---
  if (lyricStyle === 'kinetic' && type === 'synced' && isImmersive) {
     const currentLine = lyrics[activeIndex];
     const nextLine = lyrics[activeIndex + 1];
     // Calculate duration: default to 3s if last line
     const duration = currentLine && nextLine 
        ? nextLine.time - currentLine.time 
        : 3;

     // Apply Casing
     const processedLine = currentLine ? {
        ...currentLine,
        text: getProcessedText(currentLine.text || "")
     } : null;

     return (
       <LyricKinetic 
         activeLine={processedLine} 
         duration={duration}
       />
     );
  }

  // --- DRILL STYLE RENDERER (SINGLE WORD STREAM) ---
  if (lyricStyle === 'drill' && type === 'synced' && isImmersive) {
     const currentLine = lyrics[activeIndex];
     const nextLine = lyrics[activeIndex + 1];
     const duration = currentLine && nextLine 
        ? nextLine.time - currentLine.time 
        : 3;

     const processedLine = currentLine ? {
        ...currentLine,
        text: getProcessedText(currentLine.text || "")
     } : null;

     return (
       <LyricDrill 
         activeLine={processedLine} 
         duration={duration}
       />
     );
  }

     // --- STORY STYLE RENDERER (STACKING FADE) ---
  if (lyricStyle === 'story' && type === 'synced' && isImmersive) {
     const currentLine = lyrics[activeIndex];
     const nextLine = lyrics[activeIndex + 1];
     const duration = currentLine && nextLine 
        ? nextLine.time - currentLine.time 
        : 3;

     const processedLine = currentLine ? {
        ...currentLine,
        text: getProcessedText(currentLine.text || "")
     } : null;

     return (
       <LyricStory 
         activeLine={processedLine} 
         duration={duration}
       />
     );
  }

  // --- CLASSIC SCROLL RENDERER ---
  return (
    <div 
      ref={containerRef} 
      className={cn(
        "h-full w-full overflow-y-auto no-scrollbar mask-image-gradient scroll-smooth",
        "flex flex-col items-center",
        "py-[50vh]"
      )}
    >
      <div className="flex flex-col gap-8 w-full max-w-4xl px-6 text-center">
        {lyrics.map((line, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;

          return (
            <motion.div
              key={i}
              id={`lyric-${i}`}
              onClick={() => {
                if (isLyricClickToSeek && type === 'synced') {
                  requestSeek(line.time);
                }
              }}
              initial={false}
              animate={{
                opacity: isActive ? 1 : isPast ? (isImmersive ? 0.3 : 0.4) : (isImmersive ? 0.3 : 0.4),
                scale: isActive ? 1.05 : 1,
                y: 0,
                filter: "blur(0px)",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                fontSize: isActive ? lyricFontSize : lyricFontSize * 0.7,
                lineHeight: 1.4
              }}
              className={cn(
                "transition-all duration-300 select-none",
                isLyricClickToSeek && type === 'synced' && "cursor-pointer hover:text-white/80 hover:scale-[1.02]",
                isActive 
                  ? "text-white font-bold tracking-tight drop-shadow-md" 
                  : "text-gray-400 font-medium"
              )}
            >
              {line.isInstrumental ? (
                <span className="text-indigo-400/70 italic text-lg font-serif">
                  — Instrumental —
                </span>
              ) : (
                getProcessedText(line.text)
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
