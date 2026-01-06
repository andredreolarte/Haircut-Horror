import React, { useEffect, useState } from 'react';

interface JumpscareProps {
  onRestart: () => void;
}

const Jumpscare: React.FC<JumpscareProps> = ({ onRestart }) => {
  const [imageError, setImageError] = useState(false);
  const [canRestart, setCanRestart] = useState(false);

  // Play a sound if possible
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 100; // Low frequency buzz
        
        // Modulate pitch for a scream-like effect
        oscillator.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);

        gainNode.gain.value = 1.0;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1.5);
      }
    } catch (e) {
      console.error("Audio play failed", e);
    }

    // Delay the restart button so the scare lands first
    const timer = setTimeout(() => {
        setCanRestart(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full animate-shake flex items-center justify-center">
        {!imageError ? (
            <img 
                src="https://i.imgflip.com/1h83.jpg" 
                alt="JUMPSCARE" 
                className="object-cover w-full h-full brightness-75 contrast-125 grayscale-[0.2]"
                onError={() => setImageError(true)}
            />
        ) : (
            /* Fallback CSS Horror Face if image fails to load */
            <div className="relative w-96 h-[500px] bg-gray-200 rounded-[50%] shadow-[inset_0_0_60px_#000] flex flex-col items-center justify-center scale-150">
                {/* Eyes */}
                <div className="absolute top-[35%] w-full flex justify-between px-16">
                    <div className="w-24 h-24 bg-black rounded-full shadow-[0_0_20px_black] flex items-center justify-center relative overflow-hidden">
                        <div className="w-2 h-2 bg-white rounded-full absolute animate-ping"></div>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <div className="w-24 h-24 bg-black rounded-full shadow-[0_0_20px_black] flex items-center justify-center relative overflow-hidden">
                         <div className="w-2 h-2 bg-white rounded-full absolute animate-ping"></div>
                         <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                </div>
                {/* Nose Area (Missing/Shadow) */}
                <div className="absolute top-[55%] w-8 h-12 bg-black/10 blur-xl rounded-full"></div>
                {/* Mouth */}
                <div className="absolute bottom-[15%] w-64 h-32 border-b-[16px] border-red-900/80 rounded-[50%] bg-black/80 shadow-[0_0_20px_red]">
                     {/* Teeth */}
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] flex justify-center gap-1">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-4 h-6 bg-yellow-100/50 rounded-sm border border-black/50"></div>
                        ))}
                     </div>
                </div>
            </div>
        )}
      </div>

      {canRestart && (
        <div className="absolute bottom-20 z-50 animate-bounce">
           <button 
             onClick={onRestart}
             className="px-8 py-3 bg-red-900/80 hover:bg-red-800 text-white font-mono tracking-widest border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.5)] rounded"
           >
             RETURN TO SALON
           </button>
        </div>
      )}
    </div>
  );
};

export default Jumpscare;