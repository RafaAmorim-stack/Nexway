import React from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, Pressable } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { NavigationScene } from './NavigationScene';
import type { Session } from '../navigation/session';
import type { MarkerId } from '../data/catalog';
export type ARProps = { session: Session; onMarker: (id: MarkerId) => void };
export default function ARView({ session, onMarker }: ARProps) {
 const [error, setError] = React.useState('');
 const [allowed, setAllowed] = React.useState(Platform.OS !== 'android');
 const requestCamera = async () => {
  try {
   const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
   setAllowed(result === PermissionsAndroid.RESULTS.GRANTED);
   if (result !== PermissionsAndroid.RESULTS.GRANTED) setError('Permita o acesso à câmera nas configurações do Android para usar a realidade aumentada.');
  } catch { setError('Não foi possível solicitar acesso à câmera.'); }
 };
 React.useEffect(() => { if (Platform.OS === 'android') void requestCamera(); }, []);
 if (!allowed) return <View style={styles.container}><Text style={styles.caption}>{error || 'Solicitando acesso à câmera…'}</Text><Pressable accessibilityRole="button" onPress={requestCamera}><Text style={styles.caption}>Solicitar acesso novamente</Text></Pressable></View>;
 return <View style={styles.container}><ViroARSceneNavigator style={styles.camera} initialScene={{scene: NavigationScene}} viroAppProps={{ session, onMarker, onError: setError }} autofocus />{!!error && <Text style={styles.error}>{error}</Text>}<Text style={styles.caption}>Aponte para o marcador impresso. Mantenha boa iluminação.</Text></View>;
}
const styles = StyleSheet.create({container:{height:420,borderRadius:16,overflow:'hidden'},camera:{flex:1},caption:{color:'#fff',backgroundColor:'#17283c',padding:12},error:{color:'#ffb0a4',backgroundColor:'#42252a',padding:12}});
