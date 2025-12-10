import { motion, AnimatePresence } from "framer-motion";
import { LyricLine } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  activeLine: LyricLine | null;
  duration: number;
}

export default function LyricDrill({ activeLine, duration }: Props) {
  if (!activeLine) return null;

  // 1. DATA CLEANING
  const rawWords = activeLine.text.split(" ").filter(w => w.trim() !== "");
  
  // 2. SMART TIMING CALCULATION (Weighted)
  // Kita hitung "bobot" setiap kata.
  // - Base weight: 2 poin (biar kata pendek tetep punya durasi minimum)
  // - Char weight: 1 poin per huruf
  // - Punctuation bonus: 3 poin (koma/titik biasanya pause)
  
  const wordMeta = rawWords.map(word => {
    let weight = 2 + word.length; 
    if (/[,.!?;:]/.test(word)) weight += 4; // Bonus pause kalau ada tanda baca
    return { word, weight };
  });

  const totalWeight = wordMeta.reduce((sum, item) => sum + item.weight, 0);

  // Hitung durasi dan delay akumulatif untuk setiap kata
  let accumulatedDelay = 0;
  
  const wordsWithTiming = wordMeta.map((item) => {
    // Proporsi durasi berdasarkan bobot kata terhadap total bobot kalimat
    const wordDuration = (item.weight / totalWeight) * duration;
    const startDelay = accumulatedDelay;
    
    accumulatedDelay += wordDuration;

    return {
      text: item.word,
      duration: wordDuration,
      delay: startDelay
    };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 text-center overflow-hidden relative">
      <AnimatePresence mode="popLayout">
        <div key={activeLine.time} className="relative w-full h-40 flex items-center justify-center">
          
          {activeLine.isInstrumental ? (
             <motion.span
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ 
                  opacity: [0.3, 0.7, 0.3], 
                  scale: [1, 1.1, 1],
                  transition: { 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }
               }}
               exit={{ 
                  opacity: 0, 
                  scale: 0.5, 
                  filter: "blur(10px)",
                  transition: { duration: 0.2 } // Exit cepat (0.2s)
               }}
               className="absolute text-white/50 text-6xl md:text-8xl font-black tracking-widest"
             >
               ...
             </motion.span>
          ) : (
            wordsWithTiming.map((item, i) => {
              // Kita percepat sedikit durasi animasinya (0.9x) dari slot waktunya
              // Supaya ada gap super tipis antar kata (breathing room)
              // TAPI untuk Drill style, kita mau seamless. Jadi kita pakai full duration.
              // Namun, kita cap minimum duration biar animasi ga glitch kalau kecepetan.
              const animationDuration = Math.max(0.1, item.duration); 

              return (
                <motion.span
                  key={`${activeLine.time}-${i}`}
                  initial={{ opacity: 0 }} 
                  animate={{ 
                    y: [60, 0, 0, -60],      
                    opacity: [0, 1, 1, 0],   
                    scale: [0.8, 1.2, 1, 0.9], 
                    filter: ["blur(12px)", "blur(0px)", "blur(0px)", "blur(15px)"],
                    rotateX: [30, 0, 0, -30] 
                  }}
                  transition={{
                    duration: animationDuration, 
                    delay: item.delay,
                    // STACCATO PROFILE (Tetap Agresif)
                    // Attack cepat (15%), Sustain panjang (70%), Release cepat (15%)
                    times: [0, 0.15, 0.85, 1], 
                    ease: "linear"
                  }}
                  className={cn(
                    "absolute font-black tracking-tighter text-white leading-none",
                    "will-change-transform", 
                    // Dynamic Sizing
                    item.text.length > 10 ? "text-6xl md:text-7xl" : 
                    item.text.length > 5 ? "text-8xl md:text-9xl" : 
                    "text-[7rem] md:text-[11rem]"
                  )}
                  style={{
                    textShadow: "0 0 50px rgba(255,255,255,0.15)",
                    zIndex: i
                  }}
                >
                  {item.text}
                </motion.span>
              );
            })
          )}
        </div>
      </AnimatePresence>

      {/* Sync Indicator */}
      <motion.div 
        key={`progress-${activeLine.time}`}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: duration, ease: "linear" }}
        className="absolute bottom-24 w-32 h-1 bg-white/30 rounded-full overflow-hidden"
      >
          <div className="w-full h-full bg-indigo-500 box-shadow-glow" />
      </motion.div>
    </div>
  );
}
