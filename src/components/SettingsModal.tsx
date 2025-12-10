import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Type, Palette, Waves, Lock, Zap, Image as ImageIcon, Upload, Trash2, Eye, EyeOff, MousePointer2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const { 
    lyricFontSize, setLyricFontSize, 
    customBackground, setCustomBackground,
    isBackgroundBlurred, setIsBackgroundBlurred,
    isLyricClickToSeek, setIsLyricClickToSeek,
    theme, setTheme,
    lyricStyle, setLyricStyle,
    lyricCasing, setLyricCasing
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomBackground(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md relative pointer-events-auto group">
              
              {/* RGB Gradient Border */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] opacity-30 group-hover:opacity-50 blur-lg transition-opacity duration-500" />
              
              {/* Glass Card */}
              <div className="relative bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-[30px] overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto no-scrollbar">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2 sticky top-0 bg-[#0a0a0a]/95 z-20 backdrop-blur-xl">
                   <div className="flex items-center gap-2">
                     <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                       <Zap size={16} className="text-indigo-400" />
                     </div>
                     <h3 className="text-lg font-bold text-white tracking-wide">Studio Config</h3>
                   </div>
                   <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                   >
                     <X size={20} />
                   </button>
                </div>

                <div className="p-6 space-y-8 pt-2">
                  
                  {/* Typography Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/80">
                        <Type size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Lyrics</span>
                      </div>
                      <span className="font-mono text-indigo-400 text-xs bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                        {lyricFontSize}px
                      </span>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 relative overflow-hidden">
                       <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-2">
                             <span className="text-xs text-gray-500 font-mono">A</span>
                             <input
                                type="range"
                                min="16"
                                max="64"
                                step="1"
                                value={lyricFontSize}
                                onChange={(e) => setLyricFontSize(Number(e.target.value))}
                                className="w-full h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                              />
                              <span className="text-lg text-gray-500 font-mono">A</span>
                          </div>
                       </div>
                    </div>

                    {/* Style Selector */}
                    <div className="grid grid-cols-2 gap-2">
                       <button
                         onClick={() => setLyricStyle('classic')}
                         className={cn(
                           "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                           lyricStyle === 'classic' 
                             ? "bg-white text-black border-white" 
                             : "bg-transparent text-white/50 border-white/10 hover:border-white/30"
                         )}
                       >
                         Classic
                       </button>
                       <button
                         onClick={() => setLyricStyle('kinetic')}
                         className={cn(
                           "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                           lyricStyle === 'kinetic' 
                             ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20" 
                             : "bg-transparent text-white/50 border-white/10 hover:border-white/30"
                         )}
                       >
                         Kinetic
                       </button>
                       <button
                         onClick={() => setLyricStyle('drill')}
                         className={cn(
                           "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                           lyricStyle === 'drill' 
                             ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20" 
                             : "bg-transparent text-white/50 border-white/10 hover:border-white/30"
                         )}
                       >
                         Drill
                       </button>
                       <button
                         onClick={() => setLyricStyle('story')}
                         className={cn(
                           "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all",
                           lyricStyle === 'story' 
                             ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                             : "bg-transparent text-white/50 border-white/10 hover:border-white/30"
                         )}
                       >
                         Story
                       </button>
                    </div>

                    {/* Casing Selector */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                       <button
                         onClick={() => setLyricCasing('original')}
                         className={cn(
                           "px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1",
                           lyricCasing === 'original' 
                             ? "bg-white text-black border-white" 
                             : "bg-transparent text-white/50 border-white/10 hover:border-white/30"
                         )}
                       >
                         Aa
                       </button>
                       <button
                         onClick={() => setLyricCasing('uppercase')}
                         className={cn(
                           "px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1",
                           lyricCasing === 'uppercase' 
                             ? "bg-white text-black border-white" 
                             : "bg-transparent text-white/50 border-white/10 hover:border-white/30"
                         )}
                       >
                         AA
                       </button>
                       <button
                         onClick={() => setLyricCasing('lowercase')}
                         className={cn(
                           "px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1",
                           lyricCasing === 'lowercase' 
                             ? "bg-white text-black border-white" 
                             : "bg-transparent text-white/50 border-white/10 hover:border-white/30"
                         )}
                       >
                         aa
                       </button>
                    </div>
                  </section>

                  {/* Interaction Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-white/80">
                      <MousePointer2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Interaction</span>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-300">Touch to Seek</span>
                          <span className="text-[10px] text-gray-600">Tap any lyric line to jump to that timestamp</span>
                        </div>
                        <button
                          onClick={() => setIsLyricClickToSeek(!isLyricClickToSeek)}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-colors duration-300",
                            isLyricClickToSeek ? "bg-indigo-600" : "bg-gray-700"
                          )}
                        >
                          <motion.div
                            initial={false}
                            animate={{ x: isLyricClickToSeek ? 26 : 2 }}
                            className="w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5"
                          />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Background Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-white/80">
                      <ImageIcon size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Ambiance</span>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-4">
                      {/* Upload Control */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-black/50 border border-white/10 overflow-hidden shrink-0 relative group/preview">
                          {customBackground ? (
                            <>
                              <img src={customBackground} className="w-full h-full object-cover" alt="Preview" />
                              <button 
                                onClick={() => setCustomBackground(null)}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity text-red-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors w-full justify-center mb-2"
                          >
                            <Upload size={14} />
                            <span>{customBackground ? "Change Image" : "Upload Image"}</span>
                          </button>
                          
                          {customBackground && (
                            <button 
                              onClick={() => setCustomBackground(null)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm font-medium text-red-400 transition-colors w-full justify-center mb-2"
                            >
                              <Trash2 size={14} />
                              <span>Remove Image</span>
                            </button>
                          )}
                          
                          <p className="text-[10px] text-gray-500 text-center">Supports JPG, PNG, WEBP</p>
                        </div>
                      </div>

                      {/* Blur Toggle */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-300">Blur Effect</span>
                          <span className="text-[10px] text-gray-600">Apply cinematic blur to background</span>
                        </div>
                        <button
                          onClick={() => setIsBackgroundBlurred(!isBackgroundBlurred)}
                          className={cn(
                            "w-12 h-6 rounded-full relative transition-colors duration-300",
                            isBackgroundBlurred ? "bg-indigo-600" : "bg-gray-700"
                          )}
                        >
                          <motion.div
                            initial={false}
                            animate={{ x: isBackgroundBlurred ? 26 : 2 }}
                            className="w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5"
                          />
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Theme Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-white/80">
                      <Palette size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Theme</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {(['obsidian', 'midnight', 'sunset'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "relative overflow-hidden rounded-xl p-3 border transition-all duration-300 flex flex-col items-center gap-2 group",
                            theme === t 
                              ? "bg-white/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                              : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-full h-8 rounded-lg mb-1",
                            t === 'obsidian' ? "bg-black border border-white/10" :
                            t === 'midnight' ? "bg-[#020617] border border-blue-900/30" :
                            "bg-[#1a0b0b] border border-red-900/30"
                          )} />
                          <span className="text-xs font-medium text-gray-400 group-hover:text-white capitalize">
                            {t}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Active Modules */}
                  <section className="grid grid-cols-1 gap-4">
                  </section>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FeatureCard({ icon, title, desc, locked }: { icon: React.ReactNode, title: string, desc: string, locked?: boolean }) {
  return (
    <div className="group relative bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-4 border border-white/5 transition-all duration-300 overflow-hidden">
      {locked && (
        <div className="absolute top-3 right-3 text-white/10 group-hover:text-white/30 transition-colors">
          <Lock size={14} />
        </div>
      )}
      <div className="mb-3 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 origin-left">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white/90">{title}</h4>
        <p className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors">{desc}</p>
      </div>
    </div>
  );
}