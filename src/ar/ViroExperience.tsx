import React, { useCallback, useEffect, useState, useReducer, useRef } from 'react';
import { AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { NavigationScene } from './NavigationScene';
import { ARContext } from './ARContext';
import type { CameraProps } from '../camera/CameraPreview';
import { materialRoute } from '../navigation/materialRoute';
import { navigationReducer, initialNavigation, guidance, validPose, METERS_PER_CELL, CHECKPOINT_TOLERANCE, type Pose } from '../navigation/relativeNavigation';

export default function ViroExperience({ session, onStartRecognized, onRackRecognized }: CameraProps) {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [tracking, setTracking] = useState('');
  const [error, setError] = useState('');
  const [navigation, navigate] = useReducer(navigationReducer, session.item.code, initialNavigation);
  const lastPoseAt = useRef(0);
  const route = materialRoute(session);
  const next = guidance(navigation, route?.checkpoints ?? []);
  const loseNavigation = useCallback(() => navigate({ type: 'lost' }), []);
  function cameraPose(pose: Pose) {
    lastPoseAt.current = Date.now();
    if (session.arrivedAt === null) navigate({ type: 'pose', pose, checkpoints: route?.checkpoints ?? [] });
  }
  function startPose(pose: Pose) {
    if (!validPose(pose)) return;
    lastPoseAt.current = Date.now();
    navigate({ type: 'calibrate', pose });
  }
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastPoseAt.current && Date.now() - lastPoseAt.current > 1500) {
        lastPoseAt.current = 0;
        loseNavigation();
      }
    }, 500);
    return () => clearInterval(timer);
  }, [loseNavigation]);
  const orientation = session.arrivedAt !== null ? 'Chegada validada pelo rack.' : !navigation.origin ? 'Orientação suspensa. Retorne ao START, olhe para o corredor principal e reconheça o marcador.' : next ? next.arrow + ' ' + next.direction + ' · ' + next.checkpoint.label + ' · ' + next.distance.toFixed(1) + ' m' : 'Checkpoints percorridos. Reconheça ' + session.item.location.id + ' para validar a chegada.';
  const reportTracking = useCallback((message: string) => setTracking(message), []);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      setActive(state === 'active');
      if (state !== 'active') loseNavigation();
      if (state === 'active') void getPermission().catch(() => setError('Não foi possível verificar a permissão.'));
    });
    return () => subscription.remove();
  }, [getPermission, loseNavigation]);
  async function allowCamera() {
    try {
      setError('');
      if (permission && !permission.canAskAgain) await Linking.openSettings();
      else await requestPermission();
    } catch { setError('Não foi possível solicitar a câmera. Tente novamente.'); }
  }
  if (!permission?.granted) return <View style={styles.message}>
    <Text style={styles.heading}>Câmera de realidade aumentada</Text>
    <Text style={styles.description}>{permission ? 'Permita o acesso para reconhecer o marcador START.' : 'Verificando acesso à câmera…'}</Text>
    {!!error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
    {!!permission && <Pressable accessibilityRole="button" onPress={allowCamera} style={styles.button}><Text style={styles.buttonText}>{permission.canAskAgain ? 'Permitir câmera' : 'Abrir ajustes do aplicativo'}</Text></Pressable>}
  </View>;
  return <View style={styles.container}>
    <ARContext.Provider value={{ session, onRackRecognized, onStartRecognized, onTracking: reportTracking, navigationReady: navigation.origin !== null, onStartPose: startPose, onCameraPose: cameraPose, onNavigationLost: loseNavigation }}>
      <View style={styles.preview}>
        {active ? <ViroARSceneNavigator initialScene={{ scene: NavigationScene }} style={styles.camera} autofocus />
          : <Text style={styles.paused}>Câmera pausada enquanto o aplicativo está em segundo plano.</Text>}
        {active && <View pointerEvents="none" style={styles.overlay}><Text style={styles.overlayText}>{orientation}</Text></View>}
      </View>
    </ARContext.Provider>
    <View style={styles.instructions}>
      <Text style={styles.heading}>Depuração da navegação relativa</Text>
      <Text style={styles.description}>X atual: {navigation.position?.x.toFixed(2) ?? '—'} m · Z atual: {navigation.position?.z.toFixed(2) ?? '—'} m</Text>
      <Text style={styles.description}>Próximo checkpoint: {next?.checkpoint.label ?? (navigation.origin ? 'Aguardando validação do rack' : 'Aguardando START')}</Text>
      <Text style={styles.description}>Distância: {next ? next.distance.toFixed(2) + ' m' : '—'} · Direção: {next ? next.direction + ' (' + next.angle.toFixed(0) + '°)' : '—'}</Text>
      <Text style={styles.caption}>Escala de teste: {METERS_PER_CELL} m/célula · tolerância: {CHECKPOINT_TOLERANCE} m. X: direita; Z: frente a partir do START.</Text>
      {!!tracking && <Text accessibilityLiveRegion="polite" style={styles.warning}>{tracking}</Text>}
      <Text style={styles.description}>{orientation}</Text>
      <Text style={styles.caption}>ViroReact · reconhecimento por imagem. Marcadores impressos com 20 × 20 cm.</Text>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { borderWidth: 1, borderColor: '#d5dbd9', backgroundColor: '#ffffff', borderRadius: 4, overflow: 'hidden' },
  overlay: { position: 'absolute', left: 12, right: 12, bottom: 16, padding: 12, backgroundColor: '#14232ee6', borderRadius: 4 }, overlayText: { color: '#ffffff', fontSize: 16, lineHeight: 24, fontWeight: '600' },
  preview: { height: 420, backgroundColor: '#1c262d' }, camera: { flex: 1 },
  message: { borderWidth: 1, borderColor: '#d5dbd9', backgroundColor: '#ffffff', borderRadius: 4, padding: 20, gap: 14 },
  heading: { color: '#27353f', fontSize: 15, fontWeight: '600' }, description: { color: '#637078', fontSize: 13, lineHeight: 20 },
  button: { backgroundColor: '#29485c', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 3, alignItems: 'center' }, buttonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  instructions: { padding: 16, gap: 10 }, caption: { color: '#69777e', fontSize: 11, lineHeight: 18 }, paused: { color: '#ffffff', padding: 24, marginTop: 180 },
  error: { color: '#88402d', fontSize: 13, lineHeight: 20 }, warning: { color: '#795a23', fontSize: 12, lineHeight: 19 },
});
