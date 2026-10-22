import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ViroARScene, ViroARImageMarker, ViroARTrackingTargets, ViroText } from '@reactvision/react-viro';
import { markers, type MarkerId } from '../data/catalog';
import { ARContext } from './ARContext';
import { markerForSession } from './markerSelection';

ViroARTrackingTargets.createTargets({
  'START-01': { source: require('../../assets/markers/START-01.png'), orientation: 'Up', physicalWidth: 0.2 },
  'RACK-A': { source: require('../../assets/markers/RACK-A.png'), orientation: 'Up', physicalWidth: 0.2 },
  'RACK-B': { source: require('../../assets/markers/RACK-B.png'), orientation: 'Up', physicalWidth: 0.2 },
  'RACK-C': { source: require('../../assets/markers/RACK-C.png'), orientation: 'Up', physicalWidth: 0.2 },
});

export function NavigationScene() {
  const context = useContext(ARContext);
  const [visible, setVisible] = useState<MarkerId[]>([]);
  const markVisible = useCallback((id: MarkerId, tracked: boolean) => {
    setVisible(previous => tracked
      ? previous.includes(id) ? previous : [...previous, id]
      : previous.includes(id) ? previous.filter(marker => marker !== id) : previous);
  }, []);
  const candidate = context ? markerForSession(context.session, visible) : undefined;
  useEffect(() => {
    if (candidate && context) context.onMarker(candidate);
  }, [candidate, context?.onMarker]);

  if (!context) return <ViroARScene />;
  const { session, onTracking } = context;
  const expected = session.phase === 'awaiting-start' ? 'START-01' : session.item.location.id;
  return <ViroARScene onTrackingUpdated={state => onTracking(state === 3 ? '' : 'Rastreamento limitado. Mova a câmera lentamente e melhore a iluminação.')}>
    {markers.map(id => {
      const target = id === session.item.location.id;
      const arrived = target && (session.phase === 'arrived' || session.phase === 'completed');
      const label = arrived ? `SETOR ${session.item.location.sector}\nPRATELEIRA ${session.item.location.shelf}`
        : id === 'START-01' ? `DESTINO: ${session.item.location.id}`
        : id === expected ? session.item.location.label : `PROCURE ${expected}`;
      return <ViroARImageMarker key={id} target={id}
        onAnchorFound={() => markVisible(id, true)}
        onAnchorUpdated={anchor => markVisible(id, !anchor.trackingMethod || anchor.trackingMethod === 'tracking')}
        onAnchorRemoved={() => markVisible(id, false)}>
        <ViroText visible={visible.includes(id)} text={label} position={[0, 0.02, 0]} rotation={[-90, 0, 0]}
          width={0.45} height={0.16} style={{ fontSize: 18, color: '#ffffff', textAlign: 'center', textAlignVertical: 'center' }} />
      </ViroARImageMarker>;
    })}
  </ViroARScene>;
}
