import React from 'react';
import { ViroARScene, ViroARImageMarker, ViroARTrackingTargets, ViroText } from '@reactvision/react-viro';
import { markers, type MarkerId } from '../data/catalog';
import type { Session } from '../navigation/session';
ViroARTrackingTargets.createTargets({
 'START-01': { source: require('../../assets/markers/START-01.png'), orientation: 'Up', physicalWidth: 0.2 },
 'RACK-A': { source: require('../../assets/markers/RACK-A.png'), orientation: 'Up', physicalWidth: 0.2 },
 'RACK-B': { source: require('../../assets/markers/RACK-B.png'), orientation: 'Up', physicalWidth: 0.2 },
 'RACK-C': { source: require('../../assets/markers/RACK-C.png'), orientation: 'Up', physicalWidth: 0.2 },
});
type Props = { sceneNavigator: { viroAppProps: { session: Session; onMarker: (id: MarkerId) => void; onError: (message: string) => void } } };
export function NavigationScene(props?: Props) {
 if (!props) return <ViroARScene />;
 const { session, onMarker, onError } = props.sceneNavigator.viroAppProps;
 return <ViroARScene onTrackingUpdated={(state) => { if (state !== 3) onError('Tracking limitado. Melhore a iluminação e mova a câmera lentamente.'); else onError(''); }}>
  {markers.map(id => <ViroARImageMarker key={id} target={id} onAnchorFound={() => onMarker(id)}>
   <ViroText text={id === session.item.location.id && (session.phase === 'arrived' || session.phase === 'completed')
    ? `SETOR ${session.item.location.sector}\nPRATELEIRA ${session.item.location.shelf}`
    : id === 'START-01' ? `DESTINO: ${session.item.location.id}` : id === session.item.location.id ? 'Reconheça START-01 primeiro' : 'Estante incorreta'}
    position={[0, 0, 0.01]} rotation={[-90, 0, 0]} width={0.55} height={0.2} scale={[0.5, 0.5, 0.5]} style={{ fontSize: 22, color: '#66e7c7', textAlign: 'center', textAlignVertical: 'center' }} />
  </ViroARImageMarker>)}
 </ViroARScene>;
}
