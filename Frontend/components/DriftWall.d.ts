import React from 'react';

export interface DriftWallDefaultItem {
  image?: string;
  title?: string;
  href?: string;
}

export interface DriftWallReviewItem {
  author?: string;
  role?: string;
  rating?: number;
  badge?: string;
  review?: string;
  title?: string;
  image?: string;
  href?: string;
}

export type DriftWallItem = DriftWallDefaultItem | DriftWallReviewItem | Record<string, any>;

export interface DriftWallProps<T = DriftWallItem> {
  items?: T[];
  renderItem?: (item: T, id: string, colIndex: number) => React.ReactNode;
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: 'up' | 'down';
  variance?: number;
  parallax?: number;
  pauseOnHover?: boolean;
  lift?: number;
  fade?: number;
  dim?: number;
  grayscale?: boolean;
  overlayColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

declare const DriftWall: React.FC<DriftWallProps<any>>;
export default DriftWall;
