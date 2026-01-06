import React from 'react';
import { Level, PointerState, Sentiment } from '../types';

interface CharacterFaceProps {
  level: Level;
  pointerState?: PointerState;
  sentiment: Sentiment;
  isCorrupted: boolean;
}

const CharacterFace: React.FC<CharacterFaceProps> = ({ level, pointerState, sentiment, isCorrupted }) => {
  // Helper to calculate pupil position relative to eye center
  const getPupilOffset = (range: number = 3) => {
    if (!pointerState) return { x: 0, y: 0 };
    // Map 0-1 pointer to -range to +range
    // Adjust slightly because canvas is larger than face area
    const x = (pointerState.x - 0.5) * range * 3; 
    const y = (pointerState.y - 0.5) * range * 3;
    return { x, y };
  };

  const pupilOffset = getPupilOffset(3);
  const isInteracting = pointerState?.isActive;

  // ----------------------------------------------------------------------
  // LEVEL 1: Normal / Cute (Always starts here)
  // ----------------------------------------------------------------------
  if (level === Level.LEVEL_1) {
    return (
      <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-xl transition-all duration-300">
        {/* Head */}
        <ellipse cx="100" cy="120" rx="70" ry="85" fill="#FFE0BD" />
        {/* Ears */}
        <circle cx="25" cy="120" r="10" fill="#FFE0BD" />
        <circle cx="175" cy="120" r="10" fill="#FFE0BD" />
        {/* Blush - stronger if happy */}
        <ellipse cx="60" cy="140" rx="10" ry="5" fill="#FFB6C1" opacity={sentiment === 'HAPPY' ? "0.8" : "0.4"} />
        <ellipse cx="140" cy="140" rx="10" ry="5" fill="#FFB6C1" opacity={sentiment === 'HAPPY' ? "0.8" : "0.4"} />
        
        {/* Eyes */}
        <g transform={`translate(0, ${sentiment === 'SAD' ? 2 : 0})`}>
             {isInteracting || sentiment === 'SAD' ? (
                // OPEN EYES
                <g>
                    <circle cx="65" cy="110" r="8" fill="#333" />
                    <circle cx="135" cy="110" r="8" fill="#333" />
                    <circle cx={65 + pupilOffset.x} cy={110 + pupilOffset.y} r="3" fill="white" />
                    <circle cx={135 + pupilOffset.x} cy={110 + pupilOffset.y} r="3" fill="white" />
                    {/* Sad Eyebrows */}
                    {sentiment === 'SAD' && (
                        <>
                           <path d="M 55 100 Q 65 95 75 100" stroke="#333" strokeWidth="2" fill="none" />
                           <path d="M 125 100 Q 135 95 145 100" stroke="#333" strokeWidth="2" fill="none" />
                        </>
                    )}
                </g>
             ) : (
                // CLOSED HAPPY EYES (Default)
                <g>
                    <path d="M 55 112 Q 65 102 75 112" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M 125 112 Q 135 102 145 112" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
             )}
        </g>

        {/* Mouth */}
        {sentiment === 'HAPPY' && (
            <path d="M 75 160 Q 100 180 125 160" stroke="#D35F5F" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
        {sentiment === 'NEUTRAL' && (
            <path d="M 85 170 Q 100 170 115 170" stroke="#D35F5F" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
        {sentiment === 'SAD' && (
            <path d="M 80 175 Q 100 160 120 175" stroke="#D35F5F" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}

        {/* Neck */}
        <rect x="80" y="200" width="40" height="50" fill="#FFE0BD" />
      </svg>
    );
  }

  // ----------------------------------------------------------------------
  // LEVEL 2
  // ----------------------------------------------------------------------
  if (level === Level.LEVEL_2) {
    // If NOT corrupted (playing well), she looks mostly normal but reserved
    if (!isCorrupted) {
        return (
            <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-xl">
              <ellipse cx="100" cy="120" rx="70" ry="85" fill="#FFE0BD" />
              <circle cx="25" cy="120" r="10" fill="#FFE0BD" />
              <circle cx="175" cy="120" r="10" fill="#FFE0BD" />
              
              {/* Eyes - Calm/Observant */}
              <circle cx="65" cy="110" r="8" fill="#333" />
              <circle cx="135" cy="110" r="8" fill="#333" />
              <circle cx={65 + pupilOffset.x} cy={110 + pupilOffset.y} r="3" fill="white" />
              <circle cx={135 + pupilOffset.x} cy={110 + pupilOffset.y} r="3" fill="white" />

              {/* Mouth - Small Smile or Line */}
              {sentiment === 'HAPPY' ? (
                  <path d="M 85 165 Q 100 175 115 165" stroke="#D35F5F" strokeWidth="2" fill="none" />
              ) : (
                  <line x1="90" y1="170" x2="110" y2="170" stroke="#D35F5F" strokeWidth="2" />
              )}
              
              <rect x="80" y="200" width="40" height="50" fill="#FFE0BD" />
            </svg>
        );
    } 

    // If Corrupted (Previous haircut was bad): Disturbed / Uncanny
    return (
      <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-xl filter sepia-[0.3]">
        <ellipse cx="100" cy="120" rx="70" ry="85" fill="#EAD2B0" />
        <circle cx="25" cy="120" r="10" fill="#EAD2B0" />
        <circle cx="175" cy="120" r="10" fill="#EAD2B0" />
        
        {/* Eyes (Worried/Staring) */}
        <circle cx="65" cy="110" r="9" fill="white" stroke="#333" strokeWidth="1" />
        <circle cx="135" cy="110" r="9" fill="white" stroke="#333" strokeWidth="1" />
        <circle cx={65 + pupilOffset.x} cy={110 + pupilOffset.y} r="3" fill="#222" />
        <circle cx={135 + pupilOffset.x} cy={110 + pupilOffset.y} r="3" fill="#222" />

        {/* Eyebrows (Worried) */}
        <path d="M 55 95 Q 65 90 75 98" stroke="#333" strokeWidth="2" fill="none" />
        <path d="M 125 98 Q 135 90 145 95" stroke="#333" strokeWidth="2" fill="none" />
        
        {/* Mouth (Straight/Tense) */}
        {sentiment === 'SAD' ? (
             <path d="M 85 170 Q 100 155 115 170" stroke="#8B4513" strokeWidth="2" fill="none" />
        ) : (
             <line x1="80" y1="165" x2="120" y2="165" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" />
        )}
        
        {/* Sweat Drop if drawing poorly */}
        {sentiment === 'SAD' && (
            <path d="M 145 100 Q 148 95 150 105 Q 152 110 148 112 Q 144 110 145 100" fill="#ADD8E6" opacity="0.8" />
        )}
        
        <rect x="80" y="200" width="40" height="50" fill="#EAD2B0" />
      </svg>
    );
  }

  // ----------------------------------------------------------------------
  // LEVEL 3
  // ----------------------------------------------------------------------
  if (level === Level.LEVEL_3) {
      // If NOT corrupted (Player recovered): Safe, but serious
      if (!isCorrupted) {
         return (
            <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-xl">
              <ellipse cx="100" cy="120" rx="70" ry="85" fill="#FFE0BD" />
              {/* Determined / Professional Look */}
              <circle cx="65" cy="110" r="8" fill="#333" />
              <circle cx="135" cy="110" r="8" fill="#333" />
              <circle cx={65 + pupilOffset.x} cy={110 + pupilOffset.y} r="3" fill="white" />
              <circle cx={135 + pupilOffset.x} cy={110 + pupilOffset.y} r="3" fill="white" />
              <path d="M 80 165 Q 100 175 120 165" stroke="#D35F5F" strokeWidth="2" fill="none" />
              <rect x="80" y="200" width="40" height="50" fill="#FFE0BD" />
            </svg>
         );
      }

    // HORROR / GLITCH
    const erraticX = pupilOffset.x * 1.5;
    const erraticY = pupilOffset.y * -0.5;

    return (
      <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-2xl animate-pulse">
        <defs>
          <filter id="displacement" x="0%" y="0%" height="100%" width="100%">
            <feTurbulence baseFrequency="0.05" numOctaves="2" result="turbulence" />
            <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        
        <g filter="url(#displacement)">
             {/* Head - darker, grayish */}
            <ellipse cx="100" cy="120" rx="70" ry="85" fill="#A89F91" />
            
            {/* Eyes - Asymmetrical, Creepy */}
            {/* Left Eye - Hollow with glowing pupil */}
            <circle cx="60" cy="115" r="12" fill="#1a1a1a" />
            <circle cx={60 + erraticX} cy={115 + erraticY} r="3" fill="#ff0000" className="animate-ping" />
            
            {/* Right Eye - Wide Open Staring */}
            <circle cx="140" cy="105" r="16" fill="white" stroke="black" strokeWidth="1" />
            <circle cx={140 + pupilOffset.x} cy={105 + pupilOffset.y} r="2" fill="black" />

            {/* Mouth - Distorted Scream/Glitch */}
            <path d="M 70 160 L 80 175 L 90 155 L 100 180 L 110 160 L 130 170" stroke="#4a0404" strokeWidth="4" fill="none" />
            
            <path d="M 40 80 L 50 90 M 160 80 L 150 95" stroke="#333" strokeWidth="1" opacity="0.5" />
            <rect x="85" y="200" width="30" height="50" fill="#A89F91" />
        </g>
      </svg>
    );
  }

  return null;
};

export default CharacterFace;