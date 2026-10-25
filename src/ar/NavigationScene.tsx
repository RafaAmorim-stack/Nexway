import React, { useContext, useEffect, useState } from 'react';
import { ViroARScene, ViroARImageMarker, ViroARTrackingTargets } from '@reactvision/react-viro';
import { ARContext } from './ARContext';
import { markers, type MarkerId } from '../data/catalog';
import { materialMarker } from './materialMarker';
// The full printed artwork must be 20 cm wide.
ViroARTrackingTargets.createTargets({
  'START-01': { source: require('../../assets/markers/START-01.png'), orientation: 'Up', physicalWidth: 0.2 },
  'RACK-A': { source: require('../../assets/markers/RACK-A.png'), orientation: 'Up', physicalWidth: 0.2 },
  'RACK-B': { source: require('../../assets/markers/RACK-B.png'), orientation: 'Up', physicalWidth: 0.2 },
  'RACK-C': { source: require('../../assets/markers/RACK-C.png'), orientation: 'Up', physicalWidth: 0.2 },
});
export function NavigationScene() {
  const context = useContext(ARContext);
  const [visible, setVisible] = useState<MarkerId[]>([]);
  function visibility(id: MarkerId, tracked: boolean) {
    setVisible(previous => tracked ? previous.includes(id) ? previous : [...previous, id] : previous.includes(id) ? previous.filter(value => value !== id) : previous);
  }
  useEffect(() => {
    if (!context) return;
    const marker = materialMarker(context.session, visible);
    if (marker === 'START-01') context.onStartRecognized();
    else if (marker) context.onRackRecognized(marker);
  }, [context, visible]);
  return <ViroARScene onTrackingUpdated={state => {
    context?.onTracking(state === 3 ? '' : 'Rastreamento limitado. Mova a câmera lentamente e melhore a iluminação.');
    if (state !== 3) setVisible(previous => previous.length ? [] : previous);
  }}>
    {markers.map(id => <ViroARImageMarker key={id} target={id}
      onAnchorFound={() => visibility(id, true)}
      onAnchorUpdated={anchor => visibility(id, anchor.trackingMethod === 'tracking')}
      onAnchorRemoved={() => visibility(id, false)} />)}
  </ViroARScene>;
}
