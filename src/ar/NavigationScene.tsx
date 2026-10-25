import React, { useContext } from 'react';
import { ViroARScene, ViroARImageMarker, ViroARTrackingTargets } from '@reactvision/react-viro';
import { ARContext } from './ARContext';

// Reuse the existing START artwork. The printed image must be 20 cm wide.
ViroARTrackingTargets.createTargets({
  START: { source: require('../../assets/markers/START-01.png'), orientation: 'Up', physicalWidth: 0.2 },
});

export function NavigationScene() {
  const context = useContext(ARContext);
  return <ViroARScene onTrackingUpdated={state => context?.onTracking(state === 3 ? '' : 'Rastreamento limitado. Mova a câmera lentamente e melhore a iluminação.')}>
    <ViroARImageMarker target="START" onAnchorFound={() => context?.onStartRecognized()} />
  </ViroARScene>;
}
