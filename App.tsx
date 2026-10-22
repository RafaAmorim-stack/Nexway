import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import WarehouseSimulation from './src/screens/WarehouseSimulation';
import ARExperience from './src/screens/ARExperience';

export default function App() {
  const [mode, setMode] = useState<'warehouse' | 'ar'>('warehouse');
  return <SafeAreaView style={styles.root}>
    <StatusBar style="light" />
    <View style={styles.header}><Text style={styles.brand}>NEXWAY<Text style={styles.brandSub}> / NEXUS</Text></Text><View style={styles.tabs}>
      {([{ id: 'warehouse', label: 'Armazém virtual' }, { id: 'ar', label: 'Câmera AR' }] as const).map(tab => <Pressable key={tab.id} accessibilityRole="button" accessibilityState={{ selected: mode === tab.id }} onPress={() => setMode(tab.id)} style={[styles.tab, mode === tab.id && styles.activeTab]}><Text style={[styles.tabText, mode === tab.id && styles.activeText]}>{tab.label}</Text></Pressable>)}
    </View></View>
    {mode === 'warehouse' ? <WarehouseSimulation /> : <ARExperience />}
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#08131f' }, header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1d3142', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 },
  brand: { color: '#77e6c8', fontSize: 21, fontWeight: '900', letterSpacing: 2 }, brandSub: { color: '#728da1', fontSize: 10, letterSpacing: 1 },
  tabs: { flexDirection: 'row', padding: 4, gap: 4, backgroundColor: '#132536', borderRadius: 9 }, tab: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 6 }, activeTab: { backgroundColor: '#25463f' }, tabText: { color: '#97aebf', fontSize: 12 }, activeText: { color: '#a0f4d9', fontWeight: '700' },
});
