import { createContext } from 'react';
import type { CameraProps } from '../camera/CameraPreview';
import type { Pose } from '../navigation/relativeNavigation';
export const ARContext = createContext<CameraProps & {
  navigationReady: boolean;
  onStartPose: (pose: Pose) => void;
  onCameraPose: (pose: Pose) => void;
  onNavigationLost: () => void;
  onTracking: (message: string) => void;
} | null>(null);
