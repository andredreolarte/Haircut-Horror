export enum Level {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  JUMPSCARE = 4,
  SUCCESS = 5
}

export enum ToolType {
  BRUSH = 'BRUSH',
  ERASER = 'ERASER'
}

export interface BrushSettings {
  color: string;
  size: number;
  tool: ToolType;
}

export interface PointerState {
  isActive: boolean;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
}

export type Sentiment = 'HAPPY' | 'NEUTRAL' | 'SAD' | 'SCARED';

export const SALON_COLORS = [
  '#000000', // Black
  '#5D4037', // Brown
  '#FFD700', // Blonde
  '#FF69B4', // Hot Pink
  '#FF0000', // Red
  '#4CAF50', // Green
  '#2196F3', // Blue
];