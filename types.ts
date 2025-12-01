export interface GeneratedImage {
  id: string;
  originalUrl: string;
  generatedUrl: string;
  prompt: string;
  timestamp: number;
}

export type ProcessingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ImageBuffer {
  data: string; // Base64 string
  mimeType: string;
}

export enum ViewMode {
  UPLOAD = 'UPLOAD',
  CAMERA = 'CAMERA',
  EDITOR = 'EDITOR',
  RESULT = 'RESULT'
}
