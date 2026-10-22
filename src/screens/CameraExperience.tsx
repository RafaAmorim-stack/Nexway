import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Share, Platform } from 'react-native';
import { searchItems, markers, type MarkerId } from '../data/catalog';
import { startSession, recognize, complete, metrics, type Session } from '../navigation/session';
import CameraPreview from '../camera/CameraPreview';
export default function CameraExperience() {
 const [query, setQuery] = useState('');
 const [session, setSession] = useState<Session | null>(null);
 const [simulation, setSimulation] = useState(Platform.OS === 'web');
 const [notice, setNotice] = useState('');
 const onMarker = useCallback((id: MarkerId) => setSession(s => s ? recognize(s, id) : s), []);
 const button = (label: string, onPress: () => void, secondary = false) => <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, secondary && styles.secondary]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text></Pressable>;
 const location = session?.item.location;
 return <View style={styles.root}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
  <View style={styles.intro}><Text style={styles.pageTitle}>Navegação por câmera</Text><Text style={styles.muted}>Reconheça os marcadores do percurso com realidade aumentada.</Text></View>
  {!session ? <>
   <Text style={styles.title}>Selecionar material</Text><Text style={styles.muted}>Catálogo de demonstração · 3 materiais</Text>
   <TextInput accessibilityLabel="Buscar material por código ou descrição" placeholder="Código ou descrição do material" placeholderTextColor="#7a858c" value={query} onChangeText={setQuery} style={styles.input} />
   {searchItems(query).map(item => <View key={item.code} style={styles.card}><Text style={styles.code}>{item.code}</Text><Text style={styles.heading}>{item.description}</Text><Text style={styles.muted}>{item.location.label} · Setor {item.location.sector} · Prateleira {item.location.shelf}</Text>{button('Selecionar e iniciar', () => {setSession(startSession(item));setNotice('');})}</View>)}
   {searchItems(query).length === 0 && <Text style={styles.muted}>Nenhum material encontrado. Tente outro código ou descrição.</Text>}
   {button(simulation ? 'Ativar câmera AR' : 'Usar demonstração', () => setSimulation(v => !v), true)}
   <Text style={styles.muted}>{simulation ? 'Demonstração por botões: simule a leitura dos pontos do percurso.' : 'ViroReact: reconhecimento de imagens e indicação ancorada ao marcador.'}</Text>
  </> : <>
   <Text style={styles.code}>{session.item.code}</Text><Text style={styles.title}>{session.item.description}</Text>
   <View style={styles.card}><Text style={styles.heading}>{location?.label}</Text><Text style={styles.muted}>Setor {location?.sector} · Prateleira {location?.shelf}</Text></View>
   <Text accessibilityLiveRegion="polite" style={styles.heading}>{session.phase === 'awaiting-start' ? '1 / 3 · Reconheça START-01' : session.phase === 'navigating' ? `2 / 3 · Destino ${location?.id}` : session.phase === 'arrived' ? '3 / 3 · Retire o material indicado' : 'Percurso concluído'}</Text>
   {session.phase !== 'completed' && button(simulation ? 'Ativar câmera AR' : 'Usar demonstração', () => setSimulation(v => !v), true)}
   {session.error && <Text accessibilityRole="alert" style={styles.error}>{session.error}</Text>}
   {session.phase !== 'completed' && (simulation ? <View style={styles.card}><Text style={styles.heading}>Reconhecimento de marcadores</Text><Text style={styles.muted}>Selecione o marcador para simular a leitura.</Text>{markers.map(id => <View key={id}>{button(id, () => onMarker(id), true)}</View>)}</View> : <CameraPreview session={session} onMarker={onMarker} />)}
   {session.phase === 'navigating' && <Text style={styles.muted}>Destino: {location?.label}. Use o armazém virtual para consultar o percurso ilustrativo.</Text>}
   {session.phase === 'arrived' && <View style={styles.card}><Text style={styles.heading}>Setor {location?.sector} · Prateleira {location?.shelf}</Text>{button('Confirmar retirada e concluir', () => setSession(s => s ? complete(s) : s))}</View>}
   {session.phase === 'completed' && <View style={styles.card}><Text style={styles.heading}>Concluído em {Math.round((metrics(session).durationMs ?? 0) / 1000)} segundos</Text><Text style={styles.muted}>{metrics(session).errors} ocorrência(s) de marcador incorreto</Text>{button('Compartilhar métricas JSON', async () => {try {await Share.share({message: JSON.stringify(metrics(session), null, 2)});} catch {setNotice('Não foi possível compartilhar. Tente novamente.');}})}</View>}
   {!!notice && <Text style={styles.error}>{notice}</Text>}
   {button(session.phase === 'completed' ? 'Buscar outro material' : 'Cancelar percurso', () => setSession(null), true)}
  </>}
  <Text style={styles.footer}>Ambiente de demonstração {Platform.OS === 'web' ? '· prévia web' : '· ViroReact'}</Text>
 </ScrollView></View>;
}
const styles = StyleSheet.create({
 root: { flex: 1, backgroundColor: '#f5f5f3' },
 content: { padding: 24, gap: 16, maxWidth: 800, width: '100%', alignSelf: 'center', paddingBottom: 40 },
 intro: { gap: 8, paddingTop: 8, paddingBottom: 20, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: '#dadeda' },
 pageTitle: { color: '#202b33', fontSize: 24, fontWeight: '600', letterSpacing: -0.5 },
 title: { color: '#24343f', fontSize: 20, fontWeight: '600' },
 heading: { color: '#27353f', fontSize: 15, fontWeight: '600' },
 muted: { color: '#637078', fontSize: 13, lineHeight: 20 },
 card: { padding: 16, backgroundColor: '#ffffff', borderRadius: 4, gap: 10, borderWidth: 1, borderColor: '#d5dbd9' },
 code: { color: '#516570', fontSize: 11, fontWeight: '500' },
 input: { backgroundColor: '#ffffff', borderColor: '#cdd4d5', borderWidth: 1, borderRadius: 3, paddingHorizontal: 12, paddingVertical: 12, color: '#24343f', fontSize: 13 },
 button: { backgroundColor: '#29485c', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 3, alignItems: 'center', borderWidth: 1, borderColor: '#29485c' },
 secondary: { backgroundColor: '#ffffff', borderColor: '#cdd5d6' },
 buttonText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
 secondaryText: { color: '#3e535f' },
 error: { color: '#88402d', fontSize: 13, lineHeight: 20, padding: 12, backgroundColor: '#faf0eb', borderRadius: 3, borderWidth: 1, borderColor: '#e4c4b9' },
 footer: { color: '#69777e', textAlign: 'center', marginTop: 12, fontSize: 11 },
});
