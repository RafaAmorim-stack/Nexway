import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { items, searchItems, type Item, type Location } from '../data/catalog';
import { WarehouseMap } from '../components/WarehouseMap';
import { instructionAt, routeToRack } from '../warehouse/layout';

type Playback = 'ready' | 'running' | 'paused' | 'arrived';
export default function WarehouseSimulation({ selected, onSelect }: { selected: Item; onSelect: (item: Item) => void }) {
  const [query, setQuery] = useState('');
  const [step, setStep] = useState(0);
  const [playback, setPlayback] = useState<Playback>('ready');
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const route = useMemo(() => routeToRack(selected.location.id), [selected.location.id]);
  const results = searchItems(query);
  useEffect(() => {
    if (playback !== 'running') return;
    const timer = setTimeout(() => {
      const next = Math.min(step + 1, route.length - 1);
      setStep(next);
      if (next === route.length - 1) setPlayback('arrived');
    }, 550);
    return () => clearTimeout(timer);
  }, [playback, route.length, step]);
  function select(item: Item) { onSelect(item); setStep(0); setPlayback('ready'); }
  function selectRack(id: Location['id']) {
    if (id === selected.location.id) return;
    const item = items.find(candidate => candidate.location.id === id);
    if (item) select(item);
  }
  const arrived = playback === 'arrived';
  const progress = route.length > 1 ? step / (route.length - 1) : 0;
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.intro}><View style={styles.sectionHead}><Text style={styles.title}>Localização de materiais</Text><Text style={styles.environment}>Ambiente de simulação</Text></View><Text style={styles.description}>Consulte a posição do material e simule o percurso até a estante.</Text></View>
    <View style={[styles.layout, wide && styles.wide]}>
      <View style={[styles.catalog, wide && styles.catalogWide]}>
        <View style={styles.sectionHead}><Text style={styles.heading}>Materiais</Text><Text style={styles.count}>{items.length} disponíveis</Text></View>
        <TextInput accessibilityLabel="Buscar material" style={styles.input} placeholder="Buscar por nome ou código" placeholderTextColor="#7a858c" value={query} onChangeText={setQuery} />
        <View style={styles.itemList}>
          {results.map(item => {
            const active = item.code === selected.code;
            return <Pressable key={item.code} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`Selecionar ${item.description}`} onPress={() => select(item)} style={[styles.item, active && styles.selectedItem]}>
              <Text style={styles.code}>{item.code}{active ? '  /  Selecionado' : ''}</Text><Text style={styles.itemName}>{item.description}</Text>
              <Text style={styles.small}>{item.location.label} · Setor {item.location.sector} · P{item.location.shelf}</Text>
            </Pressable>;
          })}
          {results.length === 0 && <Text style={styles.description}>Nenhum material encontrado. Tente outro nome ou código.</Text>}
        </View>
        <View style={styles.note}><Text style={styles.small}>Dados ilustrativos. Selecione um material na lista ou uma estante na planta.</Text></View>
      </View>
      <View style={styles.workspace}>
        <View style={styles.destinationHeader}><View style={styles.destinationCopy}><Text style={styles.eyebrow}>Destino</Text><Text style={styles.materialTitle}>{selected.description}</Text></View><View style={styles.badge}><Text style={styles.badgeText}>{selected.location.id}</Text></View></View>
        <WarehouseMap item={selected} route={route} step={step} onSelectRack={selectRack} />
        <View style={styles.controls}>
          <View accessibilityLiveRegion="polite" style={styles.instruction}><Text style={styles.heading}>{arrived ? 'Destino alcançado' : playback === 'ready' ? 'Aguardando início' : playback === 'paused' ? 'Simulação pausada' : 'Percurso em andamento'}</Text><Text style={styles.description}>{playback === 'ready' ? `Saída pela entrada START. Destino: ${selected.location.label}.` : instructionAt(route, step, selected)}</Text></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
          <View style={styles.actions}><Pressable accessibilityRole="button" onPress={() => {
            if (playback === 'running') setPlayback('paused');
            else if (arrived) { setStep(0); setPlayback('running'); }
            else setPlayback('running');
          }} style={styles.primary}><Text style={styles.primaryText}>{playback === 'running' ? 'Pausar percurso' : playback === 'paused' ? 'Continuar percurso' : arrived ? 'Simular novamente' : 'Simular percurso'}</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => { setStep(0); setPlayback('ready'); }} style={styles.secondary}><Text style={styles.secondaryText}>Voltar à entrada</Text></Pressable><Text style={styles.small}>{Math.round(progress * 100)}% do caminho</Text></View>
        </View>
        <View style={[styles.detail, arrived && styles.arrivedDetail]}>
          <View style={styles.sectionHead}><Text style={styles.heading}>Posição na estante</Text><Text style={styles.code}>{selected.location.label}</Text></View>
          <Text style={styles.description}>Vista frontal. Compartimento do material em destaque.</Text>
          <View style={styles.shelfGrid}>
            <View style={styles.shelfRow}><Text style={styles.levelLabel}>NÍVEL</Text>{['01', '02', '03'].map(sector => <Text key={sector} style={styles.sectorLabel}>SETOR {sector}</Text>)}</View>
            {[3, 2, 1].map(level => <View key={level} style={styles.shelfRow}><Text style={styles.levelLabel}>P{level}</Text>{['01', '02', '03'].map(sector => {
              const target = selected.location.sector === sector && selected.location.shelf === level;
              return <View key={sector} accessible accessibilityLabel={`Setor ${sector}, prateleira ${level}${target ? `: ${selected.description}` : ''}`} style={[styles.compartment, target && styles.targetCompartment]}><View style={[styles.box, target && styles.targetBox]}><View style={[styles.boxSeam, target && styles.targetSeam]} /></View><Text style={[styles.compartmentText, target && styles.targetText]}>{target ? selected.code : '—'}</Text></View>;
            })}</View>)}
          </View>
          <Text style={styles.locationSummary}>{selected.location.label} → Setor {selected.location.sector} → Prateleira {selected.location.shelf}</Text>
        </View>
      </View>
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  page: { padding: 24, gap: 24, maxWidth: 1200, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  intro: { gap: 8, paddingTop: 8, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#dadeda' },
  environment: { color: '#707a80', fontSize: 11, paddingVertical: 5, paddingHorizontal: 8, borderWidth: 1, borderColor: '#d6dbd7', borderRadius: 3 },
  eyebrow: { color: '#69747b', fontSize: 12 }, title: { color: '#202b33', fontSize: 24, fontWeight: '600', letterSpacing: -0.5 },
  description: { color: '#637078', lineHeight: 20, fontSize: 13 }, layout: { gap: 28 }, wide: { flexDirection: 'row', alignItems: 'flex-start' },
  catalog: { gap: 16 }, catalogWide: { width: 270 }, workspace: { flex: 1, gap: 16, minWidth: 0 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  heading: { color: '#27353f', fontSize: 14, fontWeight: '600' }, count: { color: '#6a767d', fontSize: 11 },
  input: { color: '#24343f', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cdd4d5', paddingHorizontal: 12, paddingVertical: 11, borderRadius: 3, fontSize: 13 },
  itemList: { borderTopWidth: 1, borderTopColor: '#d5dbd9' },
  item: { gap: 7, borderBottomWidth: 1, borderBottomColor: '#d5dbd9', borderLeftWidth: 3, borderLeftColor: 'transparent', paddingVertical: 16, paddingHorizontal: 12 },
  selectedItem: { borderLeftColor: '#294b61', backgroundColor: '#e7edef' },
  code: { color: '#516570', fontSize: 11, fontWeight: '500' }, itemName: { color: '#24343f', fontSize: 14, fontWeight: '500' }, small: { color: '#69777e', fontSize: 11, lineHeight: 18 },
  note: { paddingTop: 2, paddingHorizontal: 2 }, destinationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
  destinationCopy: { gap: 5, flexShrink: 1 }, materialTitle: { color: '#24343f', fontSize: 18, fontWeight: '600' },
  badge: { backgroundColor: '#edf0ee', paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#d5dbd8', borderRadius: 3 }, badgeText: { color: '#465a66', fontWeight: '500', fontSize: 11 },
  controls: { padding: 16, backgroundColor: '#ffffff', borderRadius: 4, gap: 14, borderWidth: 1, borderColor: '#d5dbd9' }, instruction: { gap: 5 },
  progressTrack: { height: 3, backgroundColor: '#e1e6e6', overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: '#36586d' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  primary: { backgroundColor: '#29485c', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 3 }, primaryText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  secondary: { borderWidth: 1, borderColor: '#cdd5d6', backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 3 }, secondaryText: { color: '#3e535f', fontSize: 12, fontWeight: '500' },
  detail: { borderWidth: 1, borderColor: '#d5dbd9', backgroundColor: '#ffffff', borderRadius: 4, padding: 16, gap: 14 }, arrivedDetail: { borderColor: '#8da393' },
  shelfGrid: { gap: 6 }, shelfRow: { flexDirection: 'row', gap: 6, alignItems: 'center' }, levelLabel: { width: 34, color: '#63737b', fontSize: 10, fontWeight: '500' },
  sectorLabel: { flex: 1, color: '#63737b', fontSize: 10, textAlign: 'center', paddingBottom: 4 },
  compartment: { flex: 1, backgroundColor: '#f0f2ef', minHeight: 58, borderWidth: 1, borderBottomWidth: 3, borderColor: '#cbd2cf', alignItems: 'center', justifyContent: 'center', gap: 5 },
  targetCompartment: { backgroundColor: '#f9eed8', borderColor: '#ba8a37' },
  box: { width: 24, height: 18, borderWidth: 1, borderColor: '#aeb9b5', backgroundColor: '#dde2de', alignItems: 'center' },
  boxSeam: { width: 4, height: '100%', backgroundColor: '#c7cfca' }, targetBox: { borderColor: '#a17b37', backgroundColor: '#d4b071' }, targetSeam: { backgroundColor: '#b48e4a' },
  compartmentText: { color: '#7e8b90', fontSize: 10 }, targetText: { color: '#705321', fontWeight: '600' },
  locationSummary: { color: '#4a5f6b', fontSize: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e4e7e4' },
});

