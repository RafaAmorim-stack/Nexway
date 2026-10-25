import React, { useState, useReducer } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import WarehouseSimulation from './src/screens/WarehouseSimulation';
import CameraExperience from './src/screens/CameraExperience';
import { initialMaterialSession, materialSessionReducer } from './src/navigation/materialSession';

export default function App() {
  const [mode, setMode] = useState<'warehouse' | 'ar'>('warehouse');
  const [session, dispatch] = useReducer(materialSessionReducer, undefined, initialMaterialSession);
  return <SafeAreaProvider><SafeAreaView style={styles.root}>
    <StatusBar style="dark" />
    <View style={styles.header}><Text style={styles.brand}>Nexway<Text style={styles.brandSub}>  /  Operações</Text></Text><View style={styles.tabs}>
      {([{ id: 'warehouse', label: 'Armazém virtual' }, { id: 'ar', label: 'Câmera AR' }] as const).map(tab => <Pressable key={tab.id} accessibilityRole="button" accessibilityState={{ selected: mode === tab.id }} onPress={() => setMode(tab.id)} style={[styles.tab, mode === tab.id && styles.activeTab]}><Text style={[styles.tabText, mode === tab.id && styles.activeText]}>{tab.label}</Text></Pressable>)}
    </View></View>
    {mode === 'warehouse' ? <WarehouseSimulation selected={session.item} onSelect={item => dispatch({ type: 'select', code: item.code })} /> : <CameraExperience session={session} onRackRecognized={rack => dispatch({ type: 'recognize-rack', rack, at: Date.now() })} onStartRecognized={() => dispatch({ type: 'recognize-start' })} />}
  </SafeAreaView></SafeAreaProvider>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f3' },
  header: { paddingHorizontal: 28, minHeight: 68, paddingTop: 12, paddingBottom: 0, borderBottomWidth: 1, borderBottomColor: '#dadeda', backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', columnGap: 24, rowGap: 8 },
  brand: { color: '#202b33', fontSize: 22, fontWeight: '700', letterSpacing: -0.7, paddingBottom: 12 },
  brandSub: { color: '#69747b', fontSize: 12, fontWeight: '400', letterSpacing: 0 },
  tabs: { flexDirection: 'row', gap: 24, alignSelf: 'stretch', alignItems: 'stretch' },
  tab: { paddingHorizontal: 0, paddingTop: 14, paddingBottom: 18, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#263f50' },
  tabText: { color: '#69747b', fontSize: 13 },
  activeText: { color: '#263f50', fontWeight: '600' },
});

