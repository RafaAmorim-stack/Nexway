import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet, Share, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { searchItems, markers, type MarkerId } from '../data/catalog';
import { startSession, recognize, complete, metrics, type Session } from '../navigation/session';
import ARView from '../ar/ARView';
export default function ARExperience() {
 const [query, setQuery] = useState('');
 const [session, setSession] = useState<Session | null>(null);
 const [simulation, setSimulation] = useState(true);
 const [notice, setNotice] = useState('');
 const onMarker = (id: MarkerId) => setSession(s => s ? recognize(s, id) : s);
 const button = (label: string, onPress: () => void, secondary = false) => <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, secondary && styles.secondary]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
 const location = session?.item.location;
 return <SafeAreaView style={styles.root}><StatusBar style="light" /><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
  <Text style={styles.brand}>NEXWAY <Text style={styles.tag}> / NEXUS</Text></Text>
  <Text style={styles.subtitle}>Seu próximo destino, à vista.</Text>
  {!session ? <>
   <Text style={styles.title}>Encontre seu material</Text><Text style={styles.muted}>Catálogo de demonstração · 3 materiais</Text>
   <TextInput accessibilityLabel="Buscar material por código ou descrição" placeholder="Código ou descrição do material" placeholderTextColor="#8092aa" value={query} onChangeText={setQuery} style={styles.input} />
   {searchItems(query).map(item => <View key={item.code} style={styles.card}><Text style={styles.code}>{item.code}</Text><Text style={styles.heading}>{item.description}</Text><Text style={styles.muted}>{item.location.label} · Setor {item.location.sector} · Prateleira {item.location.shelf}</Text>{button('Selecionar e iniciar', () => {setSession(startSession(item));setNotice('');})}</View>)}
   {searchItems(query).length === 0 && <Text style={styles.muted}>Nenhum material encontrado. Tente outro código ou descrição.</Text>}
   {button(simulation ? 'Modo: demonstração · ativar câmera AR' : 'Modo: câmera AR · usar demonstração', () => setSimulation(v => !v), true)}
   <Text style={styles.muted}>A demonstração usa botões para simular marcadores. A câmera AR exige um build nativo e Android compatível com ARCore.</Text>
  </> : <>
   <Text style={styles.code}>{session.item.code}</Text><Text style={styles.title}>{session.item.description}</Text>
   <View style={styles.card}><Text style={styles.heading}>{location?.label}</Text><Text style={styles.muted}>Setor {location?.sector} · Prateleira {location?.shelf}</Text></View>
   <Text accessibilityLiveRegion="polite" style={styles.heading}>{session.phase === 'awaiting-start' ? '1 / 3 · Reconheça START-01' : session.phase === 'navigating' ? `2 / 3 · Procure ${location?.id}` : session.phase === 'arrived' ? '3 / 3 · Retire o material indicado' : 'Percurso concluído'}</Text>
   {session.error && <Text accessibilityRole="alert" style={styles.error}>{session.error}</Text>}
   {session.phase !== 'completed' && (simulation ? <View style={styles.card}><Text style={styles.heading}>Demonstração de reconhecimento</Text><Text style={styles.muted}>Toque no marcador que deseja simular.</Text>{markers.map(id => <View key={id}>{button(id, () => onMarker(id), true)}</View>)}</View> : <ARView session={session} onMarker={onMarker} />)}
   {session.phase === 'navigating' && <Text style={styles.muted}>Siga a sinalização física até {location?.label}. O posicionamento das estantes precisa ser calibrado para orientação espacial por setas.</Text>}
   {session.phase === 'arrived' && <View style={styles.card}><Text style={styles.heading}>Setor {location?.sector} · Prateleira {location?.shelf}</Text>{button('Confirmar retirada e concluir', () => setSession(s => s ? complete(s) : s))}</View>}
   {session.phase === 'completed' && <View style={styles.card}><Text style={styles.heading}>Concluído em {Math.round((metrics(session).durationMs ?? 0) / 1000)} segundos</Text><Text style={styles.muted}>{metrics(session).errors} ocorrência(s) de marcador incorreto</Text>{button('Compartilhar métricas JSON', async () => {try {await Share.share({message: JSON.stringify(metrics(session), null, 2)});} catch {setNotice('Não foi possível compartilhar. Tente novamente.');}})}</View>}
   {!!notice && <Text style={styles.error}>{notice}</Text>}
   {button(session.phase === 'completed' ? 'Buscar outro material' : 'Cancelar percurso', () => setSession(null), true)}
  </>}
  <Text style={styles.footer}>Nexway · MVP {Platform.OS === 'web' ? '· prévia web' : '· Android / AR'}</Text>
 </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
 root:{flex:1,backgroundColor:'#08111f'},content:{padding:24,paddingTop:48,gap:18,maxWidth:640,width:'100%',alignSelf:'center'},
 brand:{color:'#66e7c7',fontSize:29,fontWeight:'900',letterSpacing:3},tag:{fontSize:12,color:'#8193aa'},subtitle:{color:'#94a6be',marginBottom:18},
 title:{color:'#f4f7fc',fontSize:28,fontWeight:'700'},heading:{color:'#f4f7fc',fontSize:18,fontWeight:'600'},muted:{color:'#a2b2c7',lineHeight:22},
 card:{padding:20,backgroundColor:'#111f31',borderRadius:16,gap:12,borderWidth:1,borderColor:'#24364b'},code:{color:'#66e7c7',fontWeight:'700',letterSpacing:1},
 input:{backgroundColor:'#111f31',borderColor:'#30435a',borderWidth:1,borderRadius:12,padding:16,color:'#fff',fontSize:16},
 button:{backgroundColor:'#137b68',padding:16,borderRadius:10,alignItems:'center'},secondary:{backgroundColor:'#22344c'},buttonText:{color:'#fff',fontWeight:'700'},
 error:{color:'#ffb0a4',padding:12,backgroundColor:'#42252a',borderRadius:8},footer:{color:'#71849d',textAlign:'center',marginTop:20,fontSize:12}
});
