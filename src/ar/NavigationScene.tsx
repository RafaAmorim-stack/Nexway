import { START_TARGET } from '../navigation/warehouseLayout';
import { targetSources, targetPhysicalWidths } from './huaweiTargets';
import React, { useContext, useRef } from 'react';
import { ViroARScene, ViroARImageMarker, ViroARTrackingTargets } from '@reactvision/react-viro';
import { ARContext } from './ARContext';
import { markers, type MarkerId } from '../data/catalog';
import { materialMarker } from './materialMarker';
import { canValidateRack } from '../navigation/materialSession';
import { validPose, type Pose } from '../navigation/relativeNavigation';
// Up é a orientação dos pixels da imagem, não a instalação no piso/vertical.
ViroARTrackingTargets.createTargets(Object.fromEntries(markers.map(id => [id, {
  source: targetSources[id], orientation: 'Up', physicalWidth: targetPhysicalWidths[id],
}])));
export function NavigationScene() {
  const context = useContext(ARContext);
  const visible = useRef<MarkerId[]>([]);
  const normal = useRef(false);
  const latest = useRef<{ pose: Pose; at: number } | null>(null);
  const reportedAt = useRef(0);
  function evaluate(pose: Pose) {
    if (!context || !normal.current || context.session.arrivedAt !== null) return;
    if (!context.navigationReady) {
      if (visible.current.includes(START_TARGET)) {
        context.onStartPose(pose);
        context.onStartRecognized();
      }
      return;
    }
    const marker = materialMarker(context.session, visible.current);
    if (marker && marker !== START_TARGET && (marker !== context.session.item.location.id || canValidateRack(context.session))) context.onRackRecognized(marker);
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
