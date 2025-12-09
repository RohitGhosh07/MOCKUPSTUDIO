export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  type: 'mockup' | 'edit' | 'pro';
  timestamp: number;
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface ProGenConfig {
  size: ImageSize;
  aspectRatio: string;
}

export type AppMode = 'mockup' | 'editor' | 'pro';