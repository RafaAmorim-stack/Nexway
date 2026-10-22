import React, { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { NavigationScene } from './NavigationScene';
import { ARContext } from './ARContext';
import type { CameraProps } from '../camera/CameraPreview';

export default function ViroExperience({ session, onMarker }: CameraProps) {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [tracking, setTracking] = useState('');
  const [error, setError] = useState('');
  const reportTracking = useCallback((message: string) => setTracking(message), []);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      setActive(state === 'active');
      if (state === 'active') void getPermission().catch(() => setError('Não foi possível verificar a permissão.'));
    });
    return () => subscription.remove();
  }, [getPermission]);
  async function allowCamera() {
    try {
      setError('');
      if (permission && !permission.canAskAgain) await Linking.openSettings();
      else await requestPermission();
    } catch { setError('Não foi possível solicitar a câmera. Tente novamente ou use a demonstração.'); }
  }
  if (!permission?.granted) return <View style={styles.message}>
    <Text style={styles.heading}>Câmera de realidade aumentada</Text>
    <Text style={styles.description}>{permission ? 'Permita o acesso para reconhecer os marcadores START e das estantes.' : 'Verificando acesso à câmera…'}</Text>
    {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
    {!!permission && <Pressable accessibilityRole="button" onPress={allowCamera} style={styles.button}><Text style={styles.buttonText}>{permission.canAskAgain ? 'Permitir câmera' : 'Abrir ajustes do aplicativo'}</Text></Pressable>}
  </View>;
  return <View style={styles.container}>
    <ARContext.Provider value={{ session, onMarker, onTracking: reportTracking }}>
      <View style={styles.preview}>
        {active ? <ViroARSceneNavigator initialScene={{ scene: NavigationScene }} style={styles.camera} autofocus />
          : <Text style={styles.paused}>Câmera pausada enquanto o aplicativo está em segundo plano.</Text>}
        <View pointerEvents="none" style={styles.destination}><Text style={styles.overlayLabel}>DESTINO · {session.item.code}</Text><Text style={styles.overlayTitle}>{session.item.location.label}</Text><Text style={styles.overlayText}>Setor {session.item.location.sector} · Prateleira {session.item.location.shelf}</Text></View>
      </View>
    </ARContext.Provider>
    <View style={styles.instructions}>
      {!!tracking && <Text accessibilityLiveRegion="polite" style={styles.warning}>{tracking}</Text>}
      <Text style={styles.description}>{session.phase === 'awaiting-start' ? 'Aponte a câmera para o marcador START-01 impresso.' : session.phase === 'arrived' ? 'Estante reconhecida. Confira a indicação ancorada ao marcador.' : `Aponte para o marcador ${session.item.location.id} ao chegar à estante.`}</Text>
      <Text style={styles.caption}>ViroReact · reconhecimento por imagem. Marcadores impressos com 20 × 20 cm.</Text>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { borderWidth: 1, borderColor: '#d5dbd9', backgroundColor: '#ffffff', borderRadius: 4, overflow: 'hidden' },
  preview: { height: 420, backgroundColor: '#1c262d' }, camera: { flex: 1 },
  message: { borderWidth: 1, borderColor: '#d5dbd9', backgroundColor: '#ffffff', borderRadius: 4, padding: 20, gap: 14 },
  heading: { color: '#27353f', fontSize: 15, fontWeight: '600' }, description: { color: '#637078', fontSize: 13, lineHeight: 20 },
  button: { backgroundColor: '#29485c', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 3, alignItems: 'center' }, buttonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  destination: { position: 'absolute', top: 16, left: 16, right: 16, backgroundColor: 'rgba(20,32,41,0.85)', padding: 16, gap: 6, borderRadius: 3 },
  overlayLabel: { color: '#cbd4d9', fontSize: 10 }, overlayTitle: { color: '#ffffff', fontSize: 22, fontWeight: '600' }, overlayText: { color: '#e8edf0', fontSize: 13 },
  instructions: { padding: 16, gap: 10 }, caption: { color: '#69777e', fontSize: 11, lineHeight: 18 }, paused: { color: '#ffffff', padding: 24, marginTop: 180 },
  error: { color: '#88402d', fontSize: 13, lineHeight: 20 }, warning: { color: '#795a23', fontSize: 12, lineHeight: 19 },
});
