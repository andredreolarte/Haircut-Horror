import React from 'react';
import { Play } from 'lucide-react';

interface LevelIntroProps {
  level: number;
  levelName: string;
  description: string;
  svgPath: string;
  onStart: () => void;
  isCorrupted: boolean;
}

const LevelIntro: React.FC<LevelIntroProps> = ({ level, levelName, description, svgPath, onStart, isCorrupted }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center border-4 ${isCorrupted ? 'border-red-900 bg-zinc-900 text-red-500' : 'border-pink-200'}`}>
        
        <div className="text-sm font-bold opacity-50 mb-1 tracking-widest uppercase">Level {level}</div>
        <h2 className={`text-3xl font-black mb-2 uppercase tracking-tight text-center ${isCorrupted ? 'glitch-effect' : 'text-gray-800'}`} data-text={levelName}>
            {levelName}
        </h2>
        <p className={`mb-8 text-center ${isCorrupted ? 'text-red-400' : 'text-gray-500'}`}>{description}</p>
        
        {/* Visual Target */}
        <div className={`w-64 h-72 rounded-2xl mb-8 relative flex items-center justify-center overflow-hidden border-2 ${isCorrupted ? 'bg-black border-red-900' : 'bg-pink-50 border-pink-100'}`}>
            <div className="absolute inset-0 grid grid-cols-[20px_20px] opacity-10" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Simple Face Placeholder for context */}
             <svg viewBox="0 0 200 300" className="absolute w-full h-full opacity-30">
                 <ellipse cx="100" cy="140" rx="60" ry="75" fill="currentColor" />
             </svg>
            
            {/* The Target Hair */}
             <svg viewBox="0 0 220 300" className="absolute w-full h-full drop-shadow-lg" style={{ transform: 'scale(1.4) translateY(-20px)' }}>
                 <path d={svgPath} fill={isCorrupted ? "#4a0000" : "#FF69B4"} stroke="currentColor" strokeWidth="2" />
             </svg>
             
             <div className="absolute bottom-3 bg-white/80 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase text-black">
                 Target Shape
             </div>
        </div>

        <button 
          onClick={onStart}
          className={`w-full py-4 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg
            ${isCorrupted 
                ? 'bg-red-900 text-white hover:bg-red-800 border border-red-500' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
        >
          START CUTTING <Play size={20} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default LevelIntro;