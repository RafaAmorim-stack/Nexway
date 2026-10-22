import React, { lazy, Suspense } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { Session } from '../navigation/session';
import type { MarkerId } from '../data/catalog';
export type CameraProps = { session: Session; onMarker: (id: MarkerId) => void };
// The native Viro module must never be evaluated in Expo Go.
const ViroExperience = lazy(() => import('../ar/ViroExperience'));
class ARBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <View style={styles.message}><Text style={styles.heading}>Não foi possível iniciar a realidade aumentada</Text><Text style={styles.description}>Use o build de desenvolvimento do Nexway com ViroReact em um aparelho compatível com ARKit ou ARCore. Você pode continuar pelo modo demonstração.</Text></View>;
    return this.props.children;
  }
}
export default function CameraPreview(props: CameraProps) {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return <View style={styles.message}>
    <Text style={styles.heading}>ViroReact exige o aplicativo Nexway</Text>
    <Text style={styles.description}>O Expo Go não inclui o módulo de realidade aumentada. Instale o build de desenvolvimento gerado pelo Expo EAS. Neste cliente, use a demonstração por botões.</Text>
  </View>;
  return <ARBoundary><Suspense fallback={<View style={styles.message}><Text style={styles.description}>Iniciando ViroReact…</Text></View>}><ViroExperience {...props} /></Suspense></ARBoundary>;
}
const styles = StyleSheet.create({
  message: { padding: 20, gap: 12, borderWidth: 1, borderColor: '#d5dbd9', backgroundColor: '#ffffff', borderRadius: 4 },
  heading: { color: '#27353f', fontSize: 15, fontWeight: '600' }, description: { color: '#637078', fontSize: 13, lineHeight: 20 },
});
