import React, { useEffect, useState } from 'react';
import { AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { Session } from '../navigation/session';
import type { MarkerId } from '../data/catalog';

export type CameraProps = { session: Session; onMarker: (id: MarkerId) => void };
export default function CameraPreview({ session, onMarker }: CameraProps) {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [error, setError] = useState('');
  const [cameraKey, setCameraKey] = useState(0);
  const { location } = session.item;
  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      setActive(state === 'active');
      if (state === 'active') void getPermission().catch(() => setError('Não foi possível verificar a permissão da câmera.'));
    });
    return () => listener.remove();
  }, [getPermission]);

  async function allowCamera() {
    try {
      setError('');
      if (permission && !permission.canAskAgain) {
        await Linking.openSettings();
      } else {
        const result = await requestPermission();
        if (!result.granted) setError('Acesso à câmera não autorizado. Você pode continuar no modo demonstração.');
      }
    } catch {
      setError('Não foi possível solicitar a câmera. Tente novamente ou use a demonstração.');
    }
  }
  if (!permission) return <View style={styles.message}><Text style={styles.description}>Verificando acesso à câmera…</Text></View>;
  if (!permission.granted) return <View style={styles.message}>
    <Text style={styles.heading}>Acesso à câmera</Text>
    <Text style={styles.description}>Permita o acesso para visualizar o armazém com as informações do destino na tela.</Text>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Pressable accessibilityRole="button" onPress={allowCamera} style={styles.button}><Text style={styles.buttonText}>{permission.canAskAgain ? 'Permitir câmera' : 'Abrir ajustes do aplicativo'}</Text></Pressable>
  </View>;

  const arrived = session.phase === 'arrived';
  return <View style={styles.container}>
    <View style={styles.preview}>
      {active && !error ? <CameraView key={cameraKey} style={StyleSheet.absoluteFill} facing="back" mute onMountError={() => setError('Não foi possível abrir a câmera. Feche outros aplicativos que a utilizem e tente novamente.')} />
        : <View style={styles.unavailable}><Text style={styles.overlayText}>{error || 'Câmera pausada enquanto o aplicativo está em segundo plano.'}</Text></View>}
      <View pointerEvents="none" style={styles.overlay}>
        <Text style={styles.overlayLabel}>DESTINO · {session.item.code}</Text>
        <Text style={styles.overlayTitle}>{location.label}</Text>
        <Text style={styles.overlayText}>Setor {location.sector} · Prateleira {location.shelf}</Text>
      </View>
      <View pointerEvents="none" style={styles.mode}><Text style={styles.modeText}>Simulação · posição manual</Text></View>
    </View>
    <View style={styles.instructions}>
      <Text style={styles.description}>{session.phase === 'awaiting-start' ? 'Na entrada do armazém, confirme o ponto inicial para começar.' : arrived ? 'Destino confirmado. Confira o setor e a prateleira antes de retirar o material.' : `Siga a sinalização até ${location.label}. Confirme abaixo quando chegar.`}</Text>
      <Text style={styles.caption}>A indicação acompanha a tela; a câmera não reconhece estantes ou marcadores neste modo.</Text>
      {!!error && <Pressable accessibilityRole="button" onPress={() => { setError(''); setCameraKey(key => key + 1); }} style={styles.button}><Text style={styles.buttonText}>Tentar abrir a câmera novamente</Text></Pressable>}
      {!arrived && <Pressable accessibilityRole="button" style={styles.button} onPress={() => onMarker(session.phase === 'awaiting-start' ? 'START-01' : location.id)}><Text style={styles.buttonText}>{session.phase === 'awaiting-start' ? 'Confirmar ponto inicial (simulação)' : 'Confirmar chegada (simulação)'}</Text></Pressable>}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { borderRadius: 4, overflow: 'hidden', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d5dbd9' },
  preview: { height: 380, backgroundColor: '#1c262d' },
  message: { padding: 20, backgroundColor: '#ffffff', borderRadius: 4, borderWidth: 1, borderColor: '#d5dbd9', gap: 14 },
  heading: { color: '#27353f', fontSize: 15, fontWeight: '600' }, description: { color: '#637078', fontSize: 13, lineHeight: 20 },
  button: { backgroundColor: '#29485c', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 3, alignItems: 'center' }, buttonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  overlay: { position: 'absolute', top: 16, left: 16, right: 16, backgroundColor: 'rgba(20, 32, 41, 0.85)', padding: 16, gap: 6, borderRadius: 3 },
  overlayLabel: { color: '#cbd4d9', fontSize: 10 }, overlayTitle: { color: '#ffffff', fontSize: 22, fontWeight: '600' }, overlayText: { color: '#e8edf0', fontSize: 13, lineHeight: 20 },
  mode: { position: 'absolute', bottom: 14, left: 16, backgroundColor: 'rgba(20, 32, 41, 0.85)', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 3 }, modeText: { color: '#ffffff', fontSize: 11 },
  unavailable: { flex: 1, justifyContent: 'center', padding: 24 }, instructions: { padding: 16, gap: 12 }, caption: { color: '#69777e', fontSize: 11, lineHeight: 18 },
  error: { color: '#88402d', fontSize: 13, lineHeight: 20 },
});
