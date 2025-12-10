import { useEffect, useState } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, SkipBack, SkipForward, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { audioManager } from '@/lib/audioManager';
import { formatTime, cn } from '@/lib/utils';

interface Props {
  src?: string;
}

export default function PlayerControls({ src }: Props) {
  const navigate = useNavigate();
  const {
    isPlaying, volume, currentTrack, currentTime, duration,
    setVolume, seekRequest, requestSeek
  } = useAppStore();

  const [seekValue, setSeekValue] = useState(currentTime);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coverError, setCoverError] = useState(false);

  // Load audio when src changes
  useEffect(() => {
    if (src) {
      audioManager.load(src);
    }
  }, [src]);

  // Listen for seek requests from lyrics click
  useEffect(() => {
    if (seekRequest !== null) {
      audioManager.seek(seekRequest);
      setSeekValue(seekRequest);
      requestSeek(null); // Clear the request
    }
  }, [seekRequest, requestSeek]);

  // Sync seek value with current time (when not seeking)
  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  const togglePlay = () => {
    audioManager.toggle();
  };

  const handleSeekStart = () => setIsSeeking(true);
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekEnd = () => {
    audioManager.seek(seekValue);
    setIsSeeking(false);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioManager.setVolume(val);
  };

  const handleTrackClick = () => {
    if (currentTrack) {
      const params = new URLSearchParams({
        trackId: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        cover: currentTrack.coverArt || ""
      });
      navigate(`/player?${params.toString()}`);
    }
  };

  if (!currentTrack) return null;

  const progress = duration > 0 ? (seekValue / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed bottom-0 left-0 w-full z-50 px-4 pb-4 pt-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "max-w-screen-xl mx-auto rounded-3xl p-4 transition-all duration-300",
        "bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
        isHovered ? "bg-black/80" : "bg-black/60"
      )}>
        <div className="flex flex-col gap-4">
          
          {/* Progress Bar */}
          <div className="w-full flex items-center gap-3 group">
            <span className="text-xs font-mono text-gray-500 w-10 text-right">{formatTime(seekValue)}</span>
            <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group-hover:h-2 transition-all">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={seekValue}
                onChange={handleSeekChange}
                onMouseDown={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onTouchStart={handleSeekStart}
                onTouchEnd={handleSeekEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs font-mono text-gray-500 w-10">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            {/* Track Info - Clickable to go to player */}
            <div 
              className="flex items-center gap-4 w-1/3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleTrackClick}
            >
              <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                {currentTrack.coverArt && !coverError ? (
                  <img 
                    src={currentTrack.coverArt} 
                    className="w-full h-full object-cover" 
                    onError={() => setCoverError(true)}
                  />
                ) : (
                  <Music size={20} className="text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold truncate text-sm">{currentTrack.title}</h4>
                <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-6 justify-center w-1/3">
              <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
                <SkipBack size={20} />
              </button>
              
              <button
                onClick={togglePlay}
                disabled={!src}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                  !src ? "bg-gray-800 opacity-50 cursor-not-allowed" : "bg-white hover:scale-105"
                )}
              >
                {isPlaying ? <Pause size={20} fill="black" className="text-black" /> : <Play size={20} fill="black" className="ml-1 text-black" />}
              </button>

              <button className="text-gray-400 hover:text-white transition-colors hidden sm:block">
                <SkipForward size={20} />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 w-1/3 justify-end group/vol">
              <button onClick={() => audioManager.setVolume(volume === 0 ? 1 : 0)} className="text-gray-400 hover:text-white transition-colors">
                {volume === 0 ? <VolumeX size={18}/> : volume < 0.5 ? <Volume1 size={18}/> : <Volume2 size={18}/>}
              </button>
              <div className="w-24 h-1 bg-gray-700 rounded-full relative overflow-hidden group-hover/vol:h-1.5 transition-all">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-white"
                  style={{ width: `${volume * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolume}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
