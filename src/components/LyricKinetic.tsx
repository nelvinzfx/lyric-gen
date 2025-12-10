import { motion, AnimatePresence } from "framer-motion";
import { LyricLine } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  activeLine: LyricLine | null;
  duration: number;
}

export default function LyricKinetic({ activeLine, duration }: Props) {
  if (!activeLine) return null;

  // 1. DATA CLEANING
  const rawWords = activeLine.text.split(" ").filter(w => w.trim() !== "");

  // 2. SMART TIMING (WEIGHTED) - Sama seperti Drill
  const wordMeta = rawWords.map(word => {
    let weight = 2 + word.length; 
    if (/[,.!?;:]/.test(word)) weight += 3; 
    return { word, weight };
  });

  const totalWeight = wordMeta.reduce((sum, item) => sum + item.weight, 0);
  let accumulatedDelay = 0;

  const wordsWithTiming = wordMeta.map((item) => {
    // Kita pakai 70% dari durasi total untuk reveal semua kata
    // Sisanya (30%) untuk diam/baca sebelum ganti baris
    const revealWindow = Math.max(duration * 0.8, 0.5); 
    
    const wordStep = (item.weight / totalWeight) * revealWindow;
    const delay = accumulatedDelay;
    
    accumulatedDelay += wordStep;

    return {
      text: item.word,
      delay: delay,
      isPunchy: item.word.length <= 3 || /[!A-Z]{2,}/.test(item.word) // Deteksi kata "kuat"
    };
  });

  // 3. VARIANTS
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        // Kita tidak pakai staggerChildren lagi, tapi manual delay di children
        delayChildren: 0, 
      },
    },
    exit: {
      opacity: 0,
      filter: "blur(10px)",
      scale: 1.05,
      y: -10,
      transition: { duration: 0.3, ease: "easeIn" }
    },
  };

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 30, 
      scale: 1.2, // Balik ke 1.2 (Solid Impact)
      filter: "blur(12px)" 
    },
    visible: (custom: any) => ({ 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        delay: custom.delay,
        type: "spring",
        damping: 30, // NO BOUNCE (Solid stop)
        stiffness: 350, // HIGH SPEED (Punchy)
        mass: 1
      }
    }),
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 text-center overflow-hidden relative">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeLine.time} 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex flex-wrap justify-center gap-x-4 gap-y-2 max-w-7xl content-center relative z-10"
        >
          {activeLine.isInstrumental ? (
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
               exit={{ 
                  opacity: 0,
                  transition: { duration: 0.2 }
               }}
               className="text-white/50 text-5xl md:text-7xl font-black tracking-widest"
             >
               ...
             </motion.span>
          ) : (
            wordsWithTiming.map((item, i) => (
              <motion.span
                key={`${activeLine.time}-${i}`}
                custom={{ delay: item.delay }} // Pass delay ke variants
                variants={wordVariants}
                className={cn(
                  "font-black tracking-tighter text-white leading-[0.9] drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
                  // Logic ukuran font tetap masif
                  activeLine.text.length > 50 ? "text-4xl md:text-5xl" : 
                  activeLine.text.length > 20 ? "text-6xl md:text-7xl" : 
                  "text-7xl md:text-9xl"
                )}
              >
                {item.text}
              </motion.span>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}