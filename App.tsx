import React, { useState, useEffect, useRef } from 'react';
import { Brush, Eraser, Check, RotateCcw, Eye } from 'lucide-react';
import CharacterFace from './components/CharacterFace';
import DrawingCanvas, { DrawingCanvasHandle } from './components/DrawingCanvas';
import Jumpscare from './components/Jumpscare';
import SuccessScreen from './components/SuccessScreen';
import LevelIntro from './components/LevelIntro';
import { Level, BrushSettings, ToolType, SALON_COLORS, PointerState, Sentiment } from './types';
import { SoundManager } from './utils/audioManager';

// Define target hair paths (Normalized for 220x300 viewbox)
const HAIR_PATHS = {
    [Level.LEVEL_1]: "M 45 100 C 30 150, 40 210, 50 220 L 170 220 C 180 210, 190 150, 175 100 C 170 80, 50 80, 45 100 Z", // Bob Cut
    [Level.LEVEL_2]: "M 45 120 C 45 60, 155 60, 155 120 C 155 145, 140 155, 100 155 C 60 155, 45 145, 45 120 Z", // Pixie Cut (Smallest)
    [Level.LEVEL_3]: "M 50 160 L 40 120 L 60 130 L 70 80 L 100 120 L 120 60 L 140 120 L 170 90 L 160 140 L 180 160 L 160 180 C 160 180, 130 160, 60 180 Z" // Spiky/Messy
};

function App() {
  const [currentLevel, setCurrentLevel] = useState<Level>(Level.LEVEL_1);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [pointerState, setPointerState] = useState<PointerState>({ isActive: false, x: 0.5, y: 0.5 });
  const [showGuide, setShowGuide] = useState(true);
  
  // Game State
  const [isCorrupted, setIsCorrupted] = useState(false);
  const [badCutCount, setBadCutCount] = useState(0);
  const [sentiment, setSentiment] = useState<Sentiment>('NEUTRAL');

  const canvasRef = useRef<DrawingCanvasHandle>(null);

  // Brush State
  const [brushSettings, setBrushSettings] = useState<BrushSettings>({
    color: SALON_COLORS[3], // Start with Pink
    size: 20, // Default larger brush for hair filling
    tool: ToolType.BRUSH,
  });

  // Handle Ambience Changes
  useEffect(() => {
    if (currentLevel === Level.JUMPSCARE || currentLevel === Level.SUCCESS) {
      SoundManager.stopAmbience();
    } else {
      SoundManager.playAmbience(isCorrupted ? Level.LEVEL_2 : Level.LEVEL_1);
    }
  }, [currentLevel, isCorrupted]);

  const handleInteraction = () => {
    SoundManager.resume();
  };

  const playClick = () => {
    SoundManager.playClick();
  };

  // Theme Logic
  const getTheme = () => {
    if (currentLevel === Level.JUMPSCARE) return 'bg-black';
    if (currentLevel === Level.SUCCESS) return 'bg-white';
    
    if (isCorrupted) {
        if (currentLevel === Level.LEVEL_2) return 'bg-gray-400 text-gray-900 saturate-0';
        if (currentLevel === Level.LEVEL_3) return 'bg-slate-900 text-red-700';
    } else {
        if (currentLevel === Level.LEVEL_2) return 'bg-pink-100 text-pink-800';
        if (currentLevel === Level.LEVEL_3) return 'bg-white text-gray-800 border-4 border-pink-200';
    }
    return 'bg-pink-50 text-pink-900';
  };

  const getContainerStyle = () => {
     if (currentLevel === Level.LEVEL_3 && isCorrupted) {
         return "shadow-[0_0_50px_rgba(255,0,0,0.3)] border-red-900/50";
     }
     return "shadow-xl border-white/50";
  };

  const getCursorStyle = () => {
    if (brushSettings.tool === ToolType.ERASER) {
        return 'cursor-[url(https://img.icons8.com/ios-glyphs/30/000000/scissors.png),_pointer]'; 
    }
    return 'cursor-crosshair';
  }

  // Render the dashed guide line on canvas
  const renderTargetGuide = () => {
      const pathData = HAIR_PATHS[currentLevel as keyof typeof HAIR_PATHS] || "";
      if (!showGuide) return null;

      return (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center transition-opacity duration-300">
               <svg viewBox="0 0 220 300" className="w-full h-full opacity-40" style={{ transform: 'scale(1.5) translateY(-20px)' }}>
                   {/* Shadow/Outline for better visibility */}
                   <path d={pathData} fill="none" stroke="white" strokeWidth="4" />
                   <path d={pathData} fill="none" stroke={isCorrupted ? "red" : "#FF69B4"} strokeWidth="2" strokeDasharray="8,4" />
               </svg>
          </div>
      );
  };

  const getLevelDetails = () => {
      if (isCorrupted) {
          switch(currentLevel) {
              case Level.LEVEL_1: return { name: "The Beginning", desc: "Just a simple cut. Do not mess this up." };
              case Level.LEVEL_2: return { name: "Correction", desc: "Fix your mistake. She is waiting." };
              case Level.LEVEL_3: return { name: "FINAL CHANCE", desc: "MAKE IT PERFECT OR ELSE." };
              default: return { name: "", desc: "" };
          }
      }
      switch(currentLevel) {
          case Level.LEVEL_1: return { name: "The Classic Bob", desc: "A cute, round style. Keep it neat!" };
          case Level.LEVEL_2: return { name: "The Pixie Cut", desc: "Short, sharp, and stylish. Keep it tight!" };
          case Level.LEVEL_3: return { name: "Avant-Garde Spike", desc: "Something bold and daring! Go wild!" };
          default: return { name: "", desc: "" };
      }
  };

  const handleNextLevel = () => {
    playClick();
    setShowDoneModal(false);

    // Calculate Score
    const score = canvasRef.current?.calculateScore() || 0;
    const passed = score > 50;

    // Logic for Branching
    let newIsCorrupted = isCorrupted;
    let newBadCount = badCutCount;

    if (!passed) {
        newIsCorrupted = true;
        newBadCount += 1;
    } 
    
    setIsCorrupted(newIsCorrupted);
    setBadCutCount(newBadCount);
    
    // Clear for next
    setClearTrigger(prev => prev + 1); 
    
    // Move Level
    if (currentLevel === Level.LEVEL_1) {
      setCurrentLevel(Level.LEVEL_2);
      setShowIntro(true);
    } else if (currentLevel === Level.LEVEL_2) {
      setCurrentLevel(Level.LEVEL_3);
      setShowIntro(true);
    } else if (currentLevel === Level.LEVEL_3) {
      // End Game Logic
      if (newBadCount >= 2 || (isCorrupted && !passed)) {
          setCurrentLevel(Level.JUMPSCARE);
      } else {
          setCurrentLevel(Level.SUCCESS);
      }
    }
  };

  const resetGame = () => {
    playClick();
    setCurrentLevel(Level.LEVEL_1);
    setIsCorrupted(false);
    setBadCutCount(0);
    setSentiment('NEUTRAL');
    setClearTrigger(prev => prev + 1);
    setBrushSettings({
      color: SALON_COLORS[3], 
      size: 20,
      tool: ToolType.BRUSH,
    });
    setShowDoneModal(false);
    setShowIntro(true);
  };

  if (currentLevel === Level.JUMPSCARE) {
    return <Jumpscare onRestart={resetGame} />;
  }
  
  if (currentLevel === Level.SUCCESS) {
      return <SuccessScreen onRestart={resetGame} />;
  }

  return (
    <div 
      onClick={handleInteraction}
      className={`min-h-screen w-full flex flex-col items-center justify-between transition-colors duration-1000 ${getTheme()} overflow-x-hidden overflow-y-auto`}
    >
      
      {/* Level Intro Modal */}
      {showIntro && (
          <LevelIntro 
             level={currentLevel}
             levelName={getLevelDetails().name}
             description={getLevelDetails().desc}
             svgPath={HAIR_PATHS[currentLevel as keyof typeof HAIR_PATHS]}
             onStart={() => { playClick(); setShowIntro(false); }}
             isCorrupted={isCorrupted}
          />
      )}

      {/* Header */}
      <header className="w-full text-center z-10 pointer-events-none pt-8 pb-4 shrink-0 px-4">
        <h1 className={`text-3xl font-bold tracking-widest uppercase ${currentLevel === Level.LEVEL_3 && isCorrupted ? 'glitch-effect' : ''}`} data-text="LOVELY CUTS SALON">
          {currentLevel === Level.LEVEL_1 && "🌸 Lovely Cuts Salon 🌸"}
          {currentLevel === Level.LEVEL_2 && (isCorrupted ? "Lovely Cuts Salon..." : "🌸 Lovely Cuts Salon 🌸")}
          {currentLevel === Level.LEVEL_3 && (isCorrupted ? "L̶O̶V̶E̶L̶Y̶ ̶C̶U̶T̶S̶" : "✨ Exclusive Studio ✨")}
        </h1>
        <p className="opacity-70 text-sm mt-1">
            {currentLevel === Level.LEVEL_1 && "Follow the guide!"}
            {currentLevel === Level.LEVEL_2 && (isCorrupted ? "She seems upset..." : "Keep it stylish.")}
            {currentLevel === Level.LEVEL_3 && (isCorrupted ? "DON'T MAKE HER MAD" : "Final Masterpiece")}
        </p>
      </header>

      {/* Main Game Area */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full max-w-6xl px-4 relative shrink-0 my-4">
        
        {/* Left Toolbar: Colors */}
        <div className={`flex md:flex-col gap-3 p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg ${currentLevel === Level.LEVEL_3 && isCorrupted ? 'animate-pulse border-red-900 bg-black/50' : ''}`}>
           <div className="text-xs font-bold uppercase tracking-wider mb-2 text-center hidden md:block">Dyes</div>
           {SALON_COLORS.map((color) => (
             <button
               key={color}
               onClick={() => { playClick(); setBrushSettings({ ...brushSettings, color, tool: ToolType.BRUSH }); }}
               className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${brushSettings.color === color && brushSettings.tool === ToolType.BRUSH ? 'border-black scale-110 ring-2 ring-offset-2 ring-blue-400' : 'border-transparent'}`}
               style={{ backgroundColor: color }}
               aria-label={`Select color ${color}`}
             />
           ))}
           
           <div className="w-full h-px bg-current opacity-20 my-2 hidden md:block"></div>
           
           {/* Toggle Guide Button */}
            <button
                onClick={() => setShowGuide(!showGuide)}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${showGuide ? 'bg-white text-black border-black' : 'border-transparent opacity-50'}`}
                title="Toggle Guide"
            >
                <Eye size={18} />
            </button>
        </div>

        {/* Center: Canvas & Character */}
        <div className={`relative w-[350px] h-[500px] md:w-[450px] md:h-[600px] bg-white rounded-3xl overflow-hidden border-8 transition-all duration-700 ${getContainerStyle()} ${getCursorStyle()}`}>
          
          {/* Target Guide Layer */}
          {renderTargetGuide()}

          {/* Background Layer: The Character Face */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none select-none">
             <div className="w-3/4 h-3/4 transform translate-y-8">
               <CharacterFace 
                    level={currentLevel} 
                    pointerState={pointerState} 
                    sentiment={sentiment}
                    isCorrupted={isCorrupted}
               />
             </div>
          </div>

          {/* Foreground Layer: The Painting Canvas */}
          <DrawingCanvas 
            ref={canvasRef}
            width={450} 
            height={600} 
            level={currentLevel}
            brushSettings={brushSettings}
            clearTrigger={clearTrigger}
            onPointerUpdate={setPointerState}
            onSentimentChange={setSentiment}
          />
        </div>

        {/* Right Toolbar: Tools */}
        <div className={`flex md:flex-col gap-4 p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg ${currentLevel === Level.LEVEL_3 && isCorrupted ? 'border-red-900 bg-black/50' : ''}`}>
           <div className="text-xs font-bold uppercase tracking-wider mb-2 text-center hidden md:block">Tools</div>
           
           {/* Brush Tool */}
           <button
             onClick={() => { playClick(); setBrushSettings({ ...brushSettings, tool: ToolType.BRUSH }); }}
             className={`p-3 rounded-xl transition-all ${brushSettings.tool === ToolType.BRUSH ? 'bg-white shadow-md scale-105 text-pink-600' : 'hover:bg-white/50'}`}
           >
             <Brush size={28} />
           </button>

           {/* Eraser Tool */}
           <button
             onClick={() => { playClick(); setBrushSettings({ ...brushSettings, tool: ToolType.ERASER }); }}
             className={`p-3 rounded-xl transition-all ${brushSettings.tool === ToolType.ERASER ? 'bg-white shadow-md scale-105 text-pink-600' : 'hover:bg-white/50'}`}
           >
             <Eraser size={28} />
           </button>

           <div className="w-full h-px bg-current opacity-20 my-2"></div>

           {/* Size Sliders */}
           <div className="flex flex-col items-center gap-2">
             <span className="text-[10px] uppercase font-bold opacity-70">Size</span>
             {[5, 12, 25, 40].map((size) => (
               <button
                 key={size}
                 onClick={() => { playClick(); setBrushSettings({ ...brushSettings, size }); }}
                 className={`rounded-full bg-current opacity-60 hover:opacity-100 transition-all ${brushSettings.size === size ? 'opacity-100 ring-2 ring-offset-1 ring-pink-400' : ''}`}
                 style={{ width: Math.min(size + 4, 30), height: Math.min(size + 4, 30) }}
               />
             ))}
           </div>

           <div className="w-full h-px bg-current opacity-20 my-2"></div>

            {/* Clear Button */}
           <button 
             onClick={() => { playClick(); setClearTrigger(p => p + 1); }}
             className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
             title="Clear Hair"
           >
             <RotateCcw size={20} />
           </button>
        </div>
      </main>

      {/* Footer / Done Button */}
      <footer className="z-30 pb-8 pt-4 shrink-0">
        <button
          onClick={() => { playClick(); setShowDoneModal(true); }}
          className={`px-12 py-4 rounded-full text-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3
            ${currentLevel === Level.LEVEL_1 ? 'bg-pink-500 text-white hover:bg-pink-600' : ''}
            ${currentLevel === Level.LEVEL_2 ? 'bg-gray-600 text-white hover:bg-gray-700' : ''}
            ${currentLevel === Level.LEVEL_3 && isCorrupted ? 'bg-red-800 text-black hover:bg-red-700 font-mono tracking-widest border-2 border-red-500 animate-pulse' : 'bg-pink-500 text-white hover:bg-pink-600'}
          `}
        >
          {currentLevel === Level.LEVEL_3 && isCorrupted ? 'D O N E ?' : 'Done?'}
          {currentLevel === Level.LEVEL_1 && <Check size={24} />}
        </button>
      </footer>

      {/* Confirmation Modal */}
      {showDoneModal && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 ${currentLevel === Level.LEVEL_3 && isCorrupted ? 'bg-zinc-900 border border-red-600' : ''}`}>
            <h2 className={`text-2xl font-bold mb-4 text-center ${currentLevel === Level.LEVEL_3 && isCorrupted ? 'text-red-600 glitch-effect' : 'text-gray-800'}`} data-text="Are you finished?">
              {currentLevel === Level.LEVEL_3 && isCorrupted ? 'IS IT OVER?' : 'Are you finished?'}
            </h2>
            <p className={`text-center mb-8 ${currentLevel === Level.LEVEL_3 && isCorrupted ? 'text-gray-400' : 'text-gray-600'}`}>
               {currentLevel === Level.LEVEL_1 && "Does she look fabulous?"}
               {currentLevel === Level.LEVEL_2 && "Are you sure that's enough?"}
               {currentLevel === Level.LEVEL_3 && (isCorrupted ? "THERE IS NO GOING BACK." : "Ready to reveal the masterpiece?")}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => { playClick(); setShowDoneModal(false); }}
                className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleNextLevel}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 
                  ${currentLevel === Level.LEVEL_3 && isCorrupted ? 'bg-red-700 hover:bg-red-800' : 'bg-green-500 hover:bg-green-600'}
                `}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;