import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ViroExperience from '../ar/ViroExperience';
import type { MaterialSession, RackId } from '../navigation/materialSession';
export type CameraProps = { session: MaterialSession; onStartRecognized: () => void; onRackRecognized: (rack: RackId) => void };
class ARBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <View style={styles.message}><Text style={styles.heading}>Não foi possível iniciar a realidade aumentada</Text><Text style={styles.description}>Use o build de desenvolvimento do Nexway com ViroReact em um aparelho compatível com ARKit ou ARCore.</Text></View>;
    return this.props.children;
  }
}
export default function CameraPreview(props: CameraProps) {
  return <ARBoundary><ViroExperience key={props.session.item.code} {...props} /></ARBoundary>;
}
const styles = StyleSheet.create({
  message: { padding: 20, gap: 12, borderWidth: 1, borderColor: '#d5dbd9', backgroundColor: '#ffffff', borderRadius: 4 },
  heading: { color: '#27353f', fontSize: 15, fontWeight: '600' }, description: { color: '#637078', fontSize: 13, lineHeight: 20 },
});
