import { createContext } from 'react';
import type { CameraProps } from '../camera/CameraPreview';
export const ARContext = createContext<CameraProps & {
  onStartRecognized: () => void;
  onTracking: (message: string) => void;
} | null>(null);
