import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushSettings, ToolType, PointerState } from '../types';
import { SoundManager } from '../utils/audioManager';

interface DrawingCanvasProps {
  brushSettings: BrushSettings;
  width: number;
  height: number;
  onPointerUpdate?: (state: PointerState) => void;
  clearTrigger?: number; // Prop to trigger clear externally
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  brushSettings, 
  width, 
  height, 
  onPointerUpdate,
  clearTrigger 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }
  }, []);

  // Handle external clear trigger
  useEffect(() => {
    if (context && canvasRef.current) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [clearTrigger, context]);

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
    
    // Start Audio
    SoundManager.startDrawing(brushSettings.tool === ToolType.ERASER);

    const { offsetX, offsetY } = getCoordinates(e);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    draw(e);
  }, [context, reportPointer, brushSettings.tool]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    
    // Always report pointer move even if not drawing (for hover effects if we wanted), 
    // but here we primarily care when drawing is active for performance.
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
    
    // Stop Audio
    SoundManager.stopDrawing();

    // Report inactive state
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
};

export default DrawingCanvas;