import { createContext } from 'react';
export const ARContext = createContext<{
  onStartRecognized: () => void;
  onTracking: (message: string) => void;
} | null>(null);
