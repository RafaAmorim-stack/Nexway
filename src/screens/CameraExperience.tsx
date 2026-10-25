import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import CameraPreview, { type CameraProps } from '../camera/CameraPreview';
import { materialRoute } from '../navigation/materialRoute';
import { WarehouseMap } from '../components/WarehouseMap';
import { materialStatus } from '../navigation/materialSession';

export default function CameraExperience({ session, onStartRecognized, onRackRecognized }: CameraProps) {
  const status = materialStatus(session);
  const route = materialRoute(session);
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Câmera AR · Estante destino</Text>
    <Text style={styles.description}>Reconheça START-01 e depois a estante destino. Imprima as imagens em 20 × 20 cm.</Text>
    <View style={styles.status}>
      <Text accessibilityLiveRegion="polite" style={styles.title}>{status.status}</Text>
      <Text style={styles.description}>{status.material}</Text><Text style={styles.title}>{status.destination}</Text>
    </View>
    {session.recognizedRack && <View accessibilityLiveRegion="polite">
      <Text style={styles.title}>Esperado: {session.item.location.id}</Text>
      <Text style={styles.title}>Reconhecido: {session.recognizedRack}</Text>
    </View>}
    {session.arrivedAt !== null && <Text style={styles.description}>Chegada registrada: {new Date(session.arrivedAt).toLocaleString('pt-BR')}</Text>}
    {route && <View style={styles.status}>
      <Text style={styles.title}>Rota calculada</Text>
      <Text style={styles.description}>{route.checkpoints.map(checkpoint => checkpoint.label).join(' → ')}</Text>
      {route.checkpoints.map((checkpoint, i) => <Text key={i} style={styles.description}>{checkpoint.label}: ({checkpoint.point.x}, {checkpoint.point.y})</Text>)}
      <Text accessibilityLiveRegion="polite" style={styles.title}>Instrução inicial do plano</Text>
      <Text style={styles.description}>{route.nextInstruction}</Text>
      <Text style={styles.description}>Plano a partir do START. A orientação e os valores relativos atualizados aparecem junto à câmera.</Text>
      <WarehouseMap item={session.item} route={route.points} step={0} planning />
    </View>}
    <CameraPreview session={session} onStartRecognized={onStartRecognized} onRackRecognized={onRackRecognized} />
  </ScrollView>;
}
const styles = StyleSheet.create({
  content: { padding: 24, gap: 16, maxWidth: 800, width: '100%', alignSelf: 'center' },
  title: { color: '#24343f', fontSize: 20, fontWeight: '600' },
  description: { color: '#637078', fontSize: 13, lineHeight: 20 },
  status: { backgroundColor: '#ffffff', padding: 16, borderRadius: 4 },
});

