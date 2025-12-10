import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LyricLine } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  activeLine: LyricLine | null;
  duration: number;
}

// Helper to get random integer
const getRandomInt = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

// Size variants with visual weights
const VARIANTS = [
  { size: "text-4xl md:text-6xl", weight: 1 },  // Small
  { size: "text-6xl md:text-8xl", weight: 2 },  // Medium
  { size: "text-7xl md:text-9xl", weight: 3 },  // Large
  { size: "text-8xl md:text-[8rem]", weight: 4 },  // Huge
];

export default function LyricStory({ activeLine, duration }: Props) {
  if (!activeLine) return null;

  if (activeLine.isInstrumental) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full">
           <motion.span
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ 
                opacity: [0.3, 0.7, 0.3], 
                scale: [1, 1.05, 1],
                transition: { 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }
             }}
             className="text-6xl md:text-8xl font-black text-white/50 tracking-widest"
           >
             ...
           </motion.span>
        </div>
      );
  }

  const { visualLines, totalWeight, startOffset, revealWindow } = useMemo(() => {
    const text = activeLine.text;
    const allWords = text.split(" ").filter(w => w.trim() !== "");
    
    // 1. Determine constraints
    let maxVariantIndex = 3;
    if (text.length > 80) maxVariantIndex = 1; 
    else if (text.length > 40) maxVariantIndex = 2;

    const lines: { sizeClass: string; words: { text: string; weight: number }[] }[] = [];
    
    let currentWordIdx = 0;
    let lastSizeIndex = -1;

    while (currentWordIdx < allWords.length) {
        // 2. Determine Line Length (1-3 words)
        let lineLength = getRandomInt(1, 3);
        const remaining = allWords.length - currentWordIdx;
        if (lineLength > remaining) lineLength = remaining;

        // 3. Select Size for this Line
        let variantIndex = getRandomInt(0, maxVariantIndex);
        
        if (lines.length > 0 && variantIndex === lastSizeIndex) {
            variantIndex = (variantIndex + 1) % (maxVariantIndex + 1);
        }
        if (variantIndex === 3 && lineLength > 2) {
             variantIndex = 2; 
        }
        lastSizeIndex = variantIndex;

        const lineWords = [];
        for (let i = 0; i < lineLength; i++) {
            const word = allWords[currentWordIdx + i];
            
            // --- BALANCED WEIGHTING ---
            let weight = word.length + 2; 
            if (/[.,!?;:]/.test(word)) weight += 4; 
            
            lineWords.push({ text: word, weight });
        }

        lines.push({
            sizeClass: VARIANTS[variantIndex].size,
            words: lineWords
        });

        currentWordIdx += lineLength;
    }

    const totalWeight = lines.reduce((acc, line) => 
        acc + line.words.reduce((wAcc, w) => wAcc + w.weight, 0), 0
    );

    // --- HYBRID KINETIC TIMING ---
    // 1. Small fixed start delay (avoid instant pop)
    const startOffset = 0.1; 
    
    // 2. Window of 85% duration. 
    const revealWindow = duration * 0.85;

    return { visualLines: lines, totalWeight, startOffset, revealWindow };

  }, [activeLine.text, activeLine.time, duration]);

  // Start the delay counter at the Offset
  let accumulatedDelay = startOffset;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 md:px-12 overflow-hidden">
      <AnimatePresence mode="popLayout"> 
        <motion.div
          key={activeLine.time}
          initial={{ opacity: 1 }} 
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0 } }} 
          className="w-full max-w-4xl mx-auto flex flex-col items-start justify-center h-full"
        >
          <div className="flex flex-col gap-y-0 w-full">
            {visualLines.map((line, lineIdx) => (
                <div key={`${activeLine.time}-line-${lineIdx}`} className="leading-[0.85] w-full text-left">
                    {line.words.map((wordObj, wordIdx) => {
                        const wordDuration = (wordObj.weight / totalWeight) * revealWindow;
                        const delay = accumulatedDelay;
                        accumulatedDelay += wordDuration;

                        return (
                            <span key={`${activeLine.time}-l${lineIdx}-w${wordIdx}`} className="inline-block mr-3 last:mr-0">
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8, y: 15, filter: "blur(4px)" }} 
                                    animate={{ 
                                        opacity: 1, 
                                        scale: 1, 
                                        y: 0, 
                                        filter: "blur(0px)" 
                                    }}
                                    transition={{
                                        delay: delay,
                                        duration: 0.4,
                                        ease: "easeOut"
                                    }}
                                    className={cn(
                                        "font-black tracking-tighter text-white inline-block origin-left", 
                                        line.sizeClass
                                    )}
                                >
                                    {wordObj.text}
                                </motion.span>
                            </span>
                        );
                    })}
                </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}