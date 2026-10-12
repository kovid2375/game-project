import React from 'react';

export interface TechTextProps {
  text?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  fontSize?: number;
  letterSpacing?: number;
  color?: string;
  colors?: string[] | ((char: string, index: number) => string) | null;
  accentColor?: string;
  reach?: number;
  softness?: number;
  dashLength?: number;
  dashGap?: number;
  strokeWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  reveal?: 'letter' | 'word' | 'all';
  specks?: number;
  selection?: boolean;
  labels?: boolean;
  draggable?: boolean;
  sweep?: boolean;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

declare const TechText: React.FC<TechTextProps>;
export default TechText;
