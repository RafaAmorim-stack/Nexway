import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import CameraPreview from '../camera/CameraPreview';
import { materialStatus, type MaterialSession } from '../navigation/materialSession';

export default function CameraExperience({ session, onStartRecognized }: { session: MaterialSession; onStartRecognized: () => void }) {
  const status = materialStatus(session);
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Câmera AR · START</Text>
    <Text style={styles.description}>Aponte a câmera para a imagem START-01 impressa em 20 × 20 cm.</Text>
    <View style={styles.status}>
      <Text accessibilityLiveRegion="polite" style={styles.title}>{status.status}</Text>
      <Text style={styles.description}>{status.material}</Text><Text style={styles.title}>{status.destination}</Text>
    </View>
    <CameraPreview onStartRecognized={onStartRecognized} />
  </ScrollView>;
}
const styles = StyleSheet.create({
  content: { padding: 24, gap: 16, maxWidth: 800, width: '100%', alignSelf: 'center' },
  title: { color: '#24343f', fontSize: 20, fontWeight: '600' },
  description: { color: '#637078', fontSize: 13, lineHeight: 20 },
  status: { backgroundColor: '#ffffff', padding: 16, borderRadius: 4 },
});

