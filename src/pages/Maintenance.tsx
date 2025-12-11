import React from 'react';
import { Music, Disc, Activity } from 'lucide-react';

const Maintenance = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white overflow-hidden flex items-center justify-center font-sans selection:bg-pink-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-pink-900/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-2xl w-full p-6 flex flex-col items-center text-center space-y-8">
        
        {/* Animated Icon */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-spin-slow" />
          <div className="relative bg-white/5 border border-white/10 p-6 rounded-full backdrop-blur-sm">
            <Disc className="w-12 h-12 text-pink-500 animate-[spin_3s_linear_infinite]" />
          </div>
        </div>

        {/* Main Text */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-600">
              Remixing...
            </span>
          </h1>
          
          {/* Lyrical Subtext */}
          <div className="flex flex-col space-y-1 text-lg md:text-xl text-gray-400 font-medium">
            <span className="animate-[fade-in-up_1s_ease-out]">We're tuning the frequencies.</span>
            <span className="animate-[fade-in-up_1.2s_ease-out] text-gray-600">Writing new verses.</span>
            <span className="animate-[fade-in-up_1.4s_ease-out] text-gray-700">Polishing the beat.</span>
          </div>
        </div>

        {/* Technical Status */}
        <div className="w-full max-w-xs bg-white/5 rounded-lg border border-white/5 p-4 backdrop-blur-md mt-8">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
            <span className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-green-500" />
              SYSTEM STATUS
            </span>
            <span>UPDATING</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 w-[40%] animate-[shimmer_2s_infinite_linear]" 
                 style={{ 
                   backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                   backgroundSize: '1rem 1rem'
                 }} 
            />
          </div>
          <div className="mt-2 text-[10px] text-gray-600 font-mono text-left">
            ESTIMATED RETURN: SOON™
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-gray-600 text-xs font-mono tracking-widest uppercase">
        SonicScript // Deployment Protocol
      </div>
    </div>
  );
};

export default Maintenance;
