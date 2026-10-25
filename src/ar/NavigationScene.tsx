import React, { useContext, useRef } from 'react';
import { ViroARScene, ViroARImageMarker, ViroARTrackingTargets } from '@reactvision/react-viro';
import { ARContext } from './ARContext';
import { markers, type MarkerId } from '../data/catalog';
import { materialMarker } from './materialMarker';
import { validPose, type Pose } from '../navigation/relativeNavigation';
// A imagem impressa completa deve ter 20 cm de largura.
ViroARTrackingTargets.createTargets({
  'START-01': { source: require('../../assets/markers/START-01.png'), orientation: 'Up', physicalWidth: 0.2 },
  'RACK-A': { source: require('../../assets/markers/RACK-A.png'), orientation: 'Up', physicalWidth: 0.2 },
  'RACK-B': { source: require('../../assets/markers/RACK-B.png'), orientation: 'Up', physicalWidth: 0.2 },
  'RACK-C': { source: require('../../assets/markers/RACK-C.png'), orientation: 'Up', physicalWidth: 0.2 },
});
export function NavigationScene() {
  const context = useContext(ARContext);
  const visible = useRef<MarkerId[]>([]);
  const normal = useRef(false);
  const latest = useRef<{ pose: Pose; at: number } | null>(null);
  const reportedAt = useRef(0);
  function evaluate(pose: Pose) {
    if (!context || !normal.current || context.session.arrivedAt !== null) return;
    if (!context.navigationReady) {
      if (visible.current.includes('START-01')) {
        context.onStartPose(pose);
        context.onStartRecognized();
      }
      return;
    }
    const marker = materialMarker(context.session, visible.current);
    if (marker && marker !== 'START-01') context.onRackRecognized(marker);
  }
  function visibility(id: MarkerId, tracked: boolean) {
    visible.current = tracked ? [...new Set([...visible.current, id])] : visible.current.filter(value => value !== id);
    if (latest.current && Date.now() - latest.current.at < 500) evaluate(latest.current.pose);
  }
  return <ViroARScene onTrackingUpdated={state => {
    normal.current = state === 3;
    context?.onTracking(state === 3 ? '' : 'Rastreamento limitado. Retorne ao START e calibre novamente.');
    if (state !== 3) {
      visible.current = [];
      latest.current = null;
      context?.onNavigationLost();
    }
  }} onCameraTransformUpdate={pose => {
    if (!normal.current) return;
    if (!validPose(pose)) {
      latest.current = null;
      visible.current = [];
      context?.onNavigationLost();
      return;
    }
    const at = Date.now();
    latest.current = { pose, at };
    if (at - reportedAt.current < 150) return;
    reportedAt.current = at;
    context?.onCameraPose(pose);
    evaluate(pose);
  }}>
    {markers.map(id => <ViroARImageMarker key={id} target={id}
      onAnchorFound={() => visibility(id, true)}
      onAnchorUpdated={anchor => visibility(id, anchor.trackingMethod === 'tracking')}
      onAnchorRemoved={() => visibility(id, false)} />)}
  </ViroARScene>;
}
