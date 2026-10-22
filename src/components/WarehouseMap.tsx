import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Item, Location } from '../data/catalog';
import { warehouse, type Point } from '../warehouse/layout';

type Props = { item: Item; route: Point[]; step: number; onSelectRack: (id: Location['id']) => void };
export function WarehouseMap({ item, route, step, onSelectRack }: Props) {
  const position = route[step] ?? warehouse.entrance;
  const x = useRef(new Animated.Value(position.x)).current;
  const y = useRef(new Animated.Value(position.y)).current;
  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(x, { toValue: position.x, duration: 280, useNativeDriver: false }),
      Animated.timing(y, { toValue: position.y, duration: 280, useNativeDriver: false }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [position.x, position.y, x, y]);
  return <View style={styles.frame}>
    <View style={styles.topline}><Text style={styles.small}>PLANTA DO ARMAZÉM</Text><Text style={styles.small}>VISTA SUPERIOR · FICTÍCIO</Text></View>
    <View style={styles.map} accessibilityLabel={`Armazém simulado. Destino: ${item.location.label}. Passo ${step} de ${Math.max(0, route.length - 1)}.`}>
      {Array.from({ length: warehouse.columns * warehouse.rows }, (_, i) => <View key={i} style={[styles.tile, {
        left: `${(i % warehouse.columns) * 100 / warehouse.columns}%`, top: `${Math.floor(i / warehouse.columns) * 100 / warehouse.rows}%`,
        width: `${100 / warehouse.columns}%`, height: `${100 / warehouse.rows}%`,
      }]} />)}
      {route.map((point, i) => <View key={`${point.x}-${point.y}`} style={[styles.routeCell, {
        left: `${(point.x + 0.15) * 100 / warehouse.columns}%`, top: `${(point.y + 0.15) * 100 / warehouse.rows}%`,
        width: `${70 / warehouse.columns}%`, height: `${70 / warehouse.rows}%`, backgroundColor: i <= step ? '#51dfbe' : '#1a645b',
      }]} />)}
      {warehouse.racks.map(rack => {
        const active = rack.id === item.location.id;
        return <Pressable key={rack.id} accessibilityRole="button" accessibilityLabel={`Estante ${rack.label}${active ? ', destino selecionado' : ', selecionar material desta estante'}`} onPress={() => onSelectRack(rack.id)} style={[styles.rack, active && styles.activeRack, {
          left: `${rack.x * 100 / warehouse.columns}%`, top: `${rack.y * 100 / warehouse.rows}%`, width: `${rack.width * 100 / warehouse.columns}%`, height: `${rack.height * 100 / warehouse.rows}%`,
        }]}>
          <Text style={[styles.rackTitle, active && styles.activeText]}>{rack.label}</Text>
          {[1, 2, 3].map(n => <View key={n} style={[styles.rackSlot, active && n === Number(item.location.sector) && styles.activeSlot]}><Text style={[styles.slotText, active && n === Number(item.location.sector) && styles.activeText]}>S{n}</Text></View>)}
          {active && <Text style={styles.target}>DESTINO</Text>}
        </Pressable>;
      })}
      <View style={styles.entrance}><Text style={styles.entranceText}>ENTRADA / START</Text></View>
      <Animated.View style={[styles.person, {
        left: x.interpolate({ inputRange: [0, warehouse.columns], outputRange: [`${50 / warehouse.columns}%`, `${100 + 50 / warehouse.columns}%`] }),
        top: y.interpolate({ inputRange: [0, warehouse.rows], outputRange: [`${50 / warehouse.rows}%`, `${100 + 50 / warehouse.rows}%`] }),
      }]}><Text style={styles.personText}>●</Text></Animated.View>
      {route.length > 0 && <View style={[styles.destination, { left: `${(route[route.length - 1]!.x + 0.5) * 100 / warehouse.columns}%`, top: `${(route[route.length - 1]!.y + 0.5) * 100 / warehouse.rows}%` }]}><Text style={styles.destinationText}>◎</Text></View>}
    </View>
    <View style={styles.legend}><Text style={styles.legendText}>● Você</Text><Text style={styles.legendText}>━ Caminho</Text><Text style={styles.legendText}>◎ Destino</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  frame: { padding: 14, borderRadius: 20, backgroundColor: '#102031', borderWidth: 1, borderColor: '#254052', gap: 14 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }, small: { color: '#91a9b9', fontSize: 10, letterSpacing: 1 },
  map: { width: '100%', aspectRatio: 15 / 13, backgroundColor: '#0a1826', borderRadius: 12, overflow: 'hidden' },
  tile: { position: 'absolute', borderWidth: 0.5, borderColor: '#172b3a' }, routeCell: { position: 'absolute', borderRadius: 5 },
  rack: { position: 'absolute', borderWidth: 2, borderColor: '#456078', borderRadius: 6, backgroundColor: '#20384c', alignItems: 'center', paddingVertical: 7, gap: 5 },
  activeRack: { borderColor: '#63edcc', backgroundColor: '#164c46' }, rackTitle: { color: '#b1c6d6', fontWeight: '900', fontSize: 20 }, activeText: { color: '#a1ffe7' },
  rackSlot: { flex: 1, width: '80%', borderWidth: 1, borderColor: '#496074', alignItems: 'center', justifyContent: 'center', borderRadius: 3 },
  activeSlot: { backgroundColor: '#287b66', borderColor: '#7bffda' }, slotText: { color: '#9bb3c7', fontSize: 10 }, target: { color: '#b6ffea', fontSize: 7, fontWeight: '800' },
  entrance: { position: 'absolute', bottom: 5, alignSelf: 'center', backgroundColor: '#18354a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 }, entranceText: { color: '#b3d2e4', fontSize: 9, fontWeight: '700' },
  person: { position: 'absolute', width: 24, height: 24, marginLeft: -12, marginTop: -12, borderRadius: 12, backgroundColor: '#edf7ff', borderWidth: 3, borderColor: '#458cf7', alignItems: 'center', justifyContent: 'center', zIndex: 3 }, personText: { color: '#2874ec', fontSize: 12 },
  destination: { position: 'absolute', marginLeft: -11, marginTop: -16, zIndex: 2 }, destinationText: { color: '#d8fff2', fontSize: 25, fontWeight: '800' },
  legend: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' }, legendText: { color: '#b7d2dc', fontSize: 12 },
});
