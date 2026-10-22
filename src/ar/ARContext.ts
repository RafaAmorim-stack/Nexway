import { createContext } from 'react';
import type { Session } from '../navigation/session';
import type { MarkerId } from '../data/catalog';
export const ARContext = createContext<{
  session: Session;
  onMarker: (id: MarkerId) => void;
  onTracking: (message: string) => void;
} | null>(null);
