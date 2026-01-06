import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { BrushSettings, ToolType, PointerState, Sentiment, Level } from '../types';
import { SoundManager } from '../utils/audioManager';

interface DrawingCanvasProps {
  brushSettings: BrushSettings;
  width: number;
  height: number;
  onPointerUpdate?: (state: PointerState) => void;
  onSentimentChange?: (sentiment: Sentiment) => void;
  clearTrigger?: number;
  level: Level;
}

export interface DrawingCanvasHandle {
  calculateScore: () => number; // Returns 0 to 100
}

// Analysis logic to determine if the haircut meets the level criteria
const analyzeCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number, level: Level): number => {
  try {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let coloredPixels = 0;

      // Count non-transparent pixels (step by 4: R, G, B, Alpha)
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 10) { // Check alpha threshold
          coloredPixels++;
        }
      }

      const totalPixels = width * height;
      const fillRatio = coloredPixels / totalPixels;

      // Target fill ratios based on the haircut style (Canvas size is large relative to head)
      let targetRatio = 0.25; 
      let tolerance = 0.08;

      switch (level) {
          case Level.LEVEL_1: // Bob Cut (Medium)
              targetRatio = 0.22;
              break;
          case Level.LEVEL_2: // Pixie Cut (Smallest)
              targetRatio = 0.12; // Much less hair required
              tolerance = 0.05; // Stricter tolerance
              break;
          case Level.LEVEL_3: // Spiky/Big (Large)
              targetRatio = 0.35;
              tolerance = 0.12;
              break;
          default:
              targetRatio = 0.20;
      }

      // Score calculation: 100 if within tolerance, penalty otherwise
      const diff = Math.abs(fillRatio - targetRatio);
      
      if (diff <= tolerance) {
          return 100;
      }

      // Linear falloff scoring
      const error = diff - tolerance;
      // If error is 0.1 (10% off), score drops by 50 points.
      const score = Math.max(0, 100 - (error * 500)); 
      
      return Math.floor(score);
  } catch (e) {
      console.error("Analysis failed", e);
      return 0;
  }
};

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({ 
  brushSettings, 
  width, 
  height, 
  onPointerUpdate,
  onSentimentChange,
  clearTrigger,
  level 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }
  }, []);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    calculateScore: () => {
        if (!context || !canvasRef.current) return 0;
        return analyzeCanvas(context, width, height, level);
    }
  }));

  // Handle external clear trigger
  useEffect(() => {
    if (context && canvasRef.current) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [clearTrigger, context]);

  // Monitor Sentiment based on drawing progress
  useEffect(() => {
      if (!isDrawing) return;

      const checkSentiment = () => {
          if (context && onSentimentChange) {
              const currentScore = analyzeCanvas(context, width, height, level);
              // If score is high -> Happy
              // If score is extremely low (too much/little hair) -> Sad
              if (currentScore > 70) onSentimentChange('HAPPY');
              else if (currentScore < 30) onSentimentChange('SAD');
              else onSentimentChange('NEUTRAL');
          }
      };

      const interval = setInterval(checkSentiment, 500); // Check every 500ms
      return () => clearInterval(interval);
  }, [isDrawing, context, width, height, level, onSentimentChange]);


  const reportPointer = useCallback((e: React.MouseEvent | React.TouchEvent, active: boolean) => {
    if (!onPointerUpdate || !canvasRef.current) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    const rect = canvasRef.current.getBoundingClientRect();
    
    onPointerUpdate({
        isActive: active,
        x: offsetX / rect.width,
        y: offsetY / rect.height
    });
  }, [onPointerUpdate]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    
    setIsDrawing(true);
    reportPointer(e, true);
    
    SoundManager.startDrawing(brushSettings.tool === ToolType.ERASER);

    const { offsetX, offsetY } = getCoordinates(e);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    draw(e);
  }, [context, reportPointer, brushSettings.tool]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    
    if (isDrawing) {
        reportPointer(e, true);
    }

    if (!isDrawing) return;
    
    const { offsetX, offsetY } = getCoordinates(e);

    context.lineWidth = brushSettings.size;
    
    if (brushSettings.tool === ToolType.ERASER) {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = brushSettings.color;
    }

    context.lineTo(offsetX, offsetY);
    context.stroke();
  }, [isDrawing, context, brushSettings, reportPointer]);

  const stopDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (context) {
      context.closePath();
    }
    setIsDrawing(false);
    SoundManager.stopDrawing();

    if (onPointerUpdate) {
        onPointerUpdate({ isActive: false, x: 0.5, y: 0.5 });
    }
  }, [context, onPointerUpdate]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { offsetX: 0, offsetY: 0 };

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 touch-none cursor-crosshair z-20"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
});

export default DrawingCanvas;