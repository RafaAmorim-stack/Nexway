import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { items, searchItems, type Item, type Location } from '../data/catalog';
import { WarehouseMap } from '../components/WarehouseMap';
import { instructionAt, routeToRack } from '../warehouse/layout';

type Playback = 'ready' | 'running' | 'paused' | 'arrived';
export default function WarehouseSimulation() {
  const [selected, setSelected] = useState<Item>(items[0]!);
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
  function select(item: Item) { setSelected(item); setStep(0); setPlayback('ready'); }
  function selectRack(id: Location['id']) {
    if (id === selected.location.id) return;
    const item = items.find(candidate => candidate.location.id === id);
    if (item) select(item);
  }
  const arrived = playback === 'arrived';
  const progress = route.length > 1 ? step / (route.length - 1) : 0;
  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.intro}><Text style={styles.eyebrow}>EXPLORAR O ARMAZÉM</Text><Text style={styles.title}>Escolha o material. Veja onde encontrar.</Text><Text style={styles.description}>Um armazém virtual para visualizar o destino e acompanhar o caminho até a estante.</Text></View>
    <View style={[styles.layout, wide && styles.wide]}>
      <View style={[styles.catalog, wide && styles.catalogWide]}>
        <View style={styles.sectionHead}><Text style={styles.heading}>Materiais</Text><Text style={styles.count}>{items.length} disponíveis</Text></View>
        <TextInput accessibilityLabel="Buscar material" style={styles.input} placeholder="Buscar por nome ou código" placeholderTextColor="#7993a7" value={query} onChangeText={setQuery} />
        <View style={styles.itemList}>
          {results.map(item => {
            const active = item.code === selected.code;
            return <Pressable key={item.code} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`Selecionar ${item.description}`} onPress={() => select(item)} style={[styles.item, active && styles.selectedItem]}>
              <Text style={styles.code}>{item.code} {active ? ' · SELECIONADO' : ''}</Text><Text style={styles.itemName}>{item.description}</Text>
              <Text style={styles.small}>{item.location.label} · Setor {item.location.sector} · P{item.location.shelf}</Text>
            </Pressable>;
          })}
          {results.length === 0 && <Text style={styles.description}>Nenhum material encontrado. Tente outro nome ou código.</Text>}
        </View>
        <View style={styles.note}><Text style={styles.small}>Ambiente de demonstração: materiais e posições fictícios. Você também pode tocar nas estantes do mapa para trocar o destino.</Text></View>
      </View>
      <View style={styles.workspace}>
        <View style={styles.destinationHeader}><View style={styles.destinationCopy}><Text style={styles.eyebrow}>MATERIAL SELECIONADO</Text><Text style={styles.materialTitle}>{selected.description}</Text></View><View style={styles.badge}><Text style={styles.badgeText}>{selected.location.id}</Text></View></View>
        <WarehouseMap item={selected} route={route} step={step} onSelectRack={selectRack} />
        <View style={styles.controls}>
          <View accessibilityLiveRegion="polite" style={styles.instruction}><Text style={styles.heading}>{arrived ? 'Você chegou ao destino!' : playback === 'ready' ? 'Tudo pronto para começar' : playback === 'paused' ? 'Simulação pausada' : 'Percurso em andamento'}</Text><Text style={styles.description}>{playback === 'ready' ? `Saída pela entrada START. Destino: ${selected.location.label}.` : instructionAt(route, step, selected)}</Text></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
          <View style={styles.actions}><Pressable accessibilityRole="button" onPress={() => {
            if (playback === 'running') setPlayback('paused');
            else if (arrived) { setStep(0); setPlayback('running'); }
            else setPlayback('running');
          }} style={styles.primary}><Text style={styles.primaryText}>{playback === 'running' ? 'Pausar percurso' : playback === 'paused' ? 'Continuar percurso' : arrived ? 'Simular novamente' : 'Simular percurso'}</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => { setStep(0); setPlayback('ready'); }} style={styles.secondary}><Text style={styles.secondaryText}>Voltar à entrada</Text></Pressable><Text style={styles.small}>{Math.round(progress * 100)}% do caminho</Text></View>
        </View>
        <View style={[styles.detail, arrived && styles.arrivedDetail]}>
          <View style={styles.sectionHead}><Text style={styles.heading}>Onde está o material?</Text><Text style={styles.code}>{selected.location.label}</Text></View>
          <Text style={styles.description}>Vista frontal da estante · o compartimento destacado contém o material selecionado.</Text>
          <View style={styles.shelfGrid}>
            <View style={styles.shelfRow}><Text style={styles.levelLabel}>NÍVEL</Text>{['01', '02', '03'].map(sector => <Text key={sector} style={styles.sectorLabel}>SETOR {sector}</Text>)}</View>
            {[3, 2, 1].map(level => <View key={level} style={styles.shelfRow}><Text style={styles.levelLabel}>P{level}</Text>{['01', '02', '03'].map(sector => {
              const target = selected.location.sector === sector && selected.location.shelf === level;
              return <View key={sector} accessible accessibilityLabel={`Setor ${sector}, prateleira ${level}${target ? `: ${selected.description}` : ''}`} style={[styles.compartment, target && styles.targetCompartment]}><Text style={[styles.box, target && styles.targetBox]}>{target ? '◆' : '▣'}</Text><Text style={[styles.compartmentText, target && styles.targetText]}>{target ? selected.code : 'Estoque'}</Text></View>;
            })}</View>)}
          </View>
          <Text style={styles.locationSummary}>{selected.location.label} → Setor {selected.location.sector} → Prateleira {selected.location.shelf}</Text>
        </View>
      </View>
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  page: { padding: 20, gap: 28, maxWidth: 1180, width: '100%', alignSelf: 'center', paddingBottom: 50 }, intro: { gap: 10, paddingTop: 14 },
  eyebrow: { color: '#60dfbf', fontSize: 10, letterSpacing: 2, fontWeight: '800' }, title: { color: '#f0f7fa', fontSize: 30, fontWeight: '800', maxWidth: 600 },
  description: { color: '#9cb1c2', lineHeight: 21, fontSize: 13 }, layout: { gap: 24 }, wide: { flexDirection: 'row', alignItems: 'flex-start' },
  catalog: { gap: 14 }, catalogWide: { width: 280 }, workspace: { flex: 1, gap: 18, minWidth: 0 }, sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  heading: { color: '#ecf5fc', fontSize: 16, fontWeight: '700' }, count: { color: '#8ca8bc', fontSize: 11 },
  input: { color: '#f1f7fc', backgroundColor: '#122234', borderWidth: 1, borderColor: '#2b4255', padding: 14, borderRadius: 10, fontSize: 13 },
  itemList: { gap: 10 }, item: { gap: 8, borderWidth: 1, borderColor: '#243a4b', padding: 16, borderRadius: 12, backgroundColor: '#102031' }, selectedItem: { borderColor: '#58d6b7', backgroundColor: '#14362f' },
  code: { color: '#73e0c5', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 }, itemName: { color: '#eff7fb', fontSize: 15, fontWeight: '600' }, small: { color: '#96b0c2', fontSize: 11, lineHeight: 18 },
  note: { padding: 14, borderRadius: 10, backgroundColor: '#0e1b29' }, destinationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }, destinationCopy: { gap: 7, flexShrink: 1 }, materialTitle: { color: '#f1f8fc', fontSize: 21, fontWeight: '700' },
  badge: { backgroundColor: '#173c35', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 7 }, badgeText: { color: '#7deaca', fontWeight: '800', fontSize: 12 },
  controls: { padding: 18, backgroundColor: '#102031', borderRadius: 14, gap: 16, borderWidth: 1, borderColor: '#254052' }, instruction: { gap: 7 }, progressTrack: { height: 5, backgroundColor: '#223e4e', borderRadius: 3, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: '#63e3bf' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }, primary: { backgroundColor: '#62e4bf', paddingHorizontal: 18, paddingVertical: 13, borderRadius: 9 }, primaryText: { color: '#08271e', fontSize: 12, fontWeight: '800' }, secondary: { borderWidth: 1, borderColor: '#375365', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 9 }, secondaryText: { color: '#c8dce7', fontSize: 12, fontWeight: '600' },
  detail: { borderWidth: 1, borderColor: '#254052', backgroundColor: '#102031', borderRadius: 14, padding: 18, gap: 14 }, arrivedDetail: { borderColor: '#62e4bf' }, shelfGrid: { gap: 7 }, shelfRow: { flexDirection: 'row', gap: 7, alignItems: 'center' }, levelLabel: { width: 36, color: '#879eaf', fontSize: 9, fontWeight: '700' }, sectorLabel: { flex: 1, color: '#93b1c2', fontSize: 9, textAlign: 'center', paddingBottom: 4 },
  compartment: { flex: 1, backgroundColor: '#1b3042', minHeight: 62, borderRadius: 6, borderBottomWidth: 4, borderColor: '#395267', alignItems: 'center', justifyContent: 'center', gap: 2 }, targetCompartment: { backgroundColor: '#22614e', borderColor: '#91ffd7' }, box: { color: '#7c96aa', fontSize: 24 }, targetBox: { color: '#9fffd8' }, compartmentText: { color: '#90a7b9', fontSize: 9 }, targetText: { color: '#c9ffe8', fontWeight: '800' }, locationSummary: { color: '#96eed1', fontSize: 12, fontWeight: '600' },
});
