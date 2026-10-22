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
    <View style={styles.topline}><Text style={styles.small}>Planta do armazém</Text><Text style={styles.small}>Vista superior / sem escala</Text></View>
    <View style={styles.map} accessibilityLabel={`Armazém simulado. Destino: ${item.location.label}. Passo ${step} de ${Math.max(0, route.length - 1)}.`}>
      {Array.from({ length: warehouse.columns * warehouse.rows }, (_, i) => <View key={i} style={[styles.tile, {
        left: `${(i % warehouse.columns) * 100 / warehouse.columns}%`, top: `${Math.floor(i / warehouse.columns) * 100 / warehouse.rows}%`,
        width: `${100 / warehouse.columns}%`, height: `${100 / warehouse.rows}%`,
      }]} />)}
      {route.slice(0, -1).map((point, i) => {
        const next = route[i + 1]!;
        const horizontal = point.y === next.y;
        return <View key={`${point.x}-${point.y}`} style={[styles.routeCell, {
          left: `${(Math.min(point.x, next.x) + 0.5) * 100 / warehouse.columns}%`,
          top: `${(Math.min(point.y, next.y) + 0.5) * 100 / warehouse.rows}%`,
          width: horizontal ? `${100 / warehouse.columns}%` : 3,
          height: horizontal ? 3 : `${100 / warehouse.rows}%`,
          backgroundColor: i < step ? '#355b72' : '#a5b5be',
        }]} />;
      })}
      {warehouse.racks.map(rack => {
        const active = rack.id === item.location.id;
        return <Pressable key={rack.id} accessibilityRole="button" accessibilityLabel={`Estante ${rack.label}${active ? ', destino selecionado' : ', selecionar material desta estante'}`} onPress={() => onSelectRack(rack.id)} style={[styles.rack, active && styles.activeRack, {
          left: `${rack.x * 100 / warehouse.columns}%`, top: `${rack.y * 100 / warehouse.rows}%`, width: `${rack.width * 100 / warehouse.columns}%`, height: `${rack.height * 100 / warehouse.rows}%`,
        }]}>
          <Text style={[styles.rackTitle, active && styles.activeText]}>{rack.label}</Text>
          {[1, 2, 3].map(n => <View key={n} style={[styles.rackSlot, active && n === Number(item.location.sector) && styles.activeSlot]}><Text style={[styles.slotText, active && n === Number(item.location.sector) && styles.activeText]}>S{n}</Text></View>)}
          {active && <Text style={styles.target}>Destino</Text>}
        </Pressable>;
      })}
      <View style={styles.entrance}><Text style={styles.entranceText}>Entrada · START</Text></View>
      <Animated.View style={[styles.person, {
        left: x.interpolate({ inputRange: [0, warehouse.columns], outputRange: [`${50 / warehouse.columns}%`, `${100 + 50 / warehouse.columns}%`] }),
        top: y.interpolate({ inputRange: [0, warehouse.rows], outputRange: [`${50 / warehouse.rows}%`, `${100 + 50 / warehouse.rows}%`] }),
      }]}><View style={styles.personDot} /></Animated.View>
      {route.length > 0 && <View style={[styles.destination, { left: `${(route[route.length - 1]!.x + 0.5) * 100 / warehouse.columns}%`, top: `${(route[route.length - 1]!.y + 0.5) * 100 / warehouse.rows}%` }]}><View style={styles.destinationDot} /></View>}
    </View>
    <View style={styles.legend}><View style={styles.legendItem}><View style={styles.legendPerson} /><Text style={styles.legendText}>Posição</Text></View><View style={styles.legendItem}><View style={styles.legendRoute} /><Text style={styles.legendText}>Percurso</Text></View><View style={styles.legendItem}><View style={styles.legendTarget} /><Text style={styles.legendText}>Destino</Text></View></View>
  </View>;
}
const styles = StyleSheet.create({
  frame: { padding: 16, borderRadius: 4, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d5dbd9', gap: 14 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }, small: { color: '#69777e', fontSize: 11 },
  map: { width: '100%', maxWidth: 480, alignSelf: 'center', aspectRatio: 15 / 13, backgroundColor: '#f7f8f5', borderWidth: 1, borderColor: '#d5dcd7', overflow: 'hidden' },
  tile: { position: 'absolute', borderWidth: 0.5, borderColor: '#e9ede7' }, routeCell: { position: 'absolute', marginTop: -1.5, marginLeft: -1.5 },
  rack: { position: 'absolute', borderWidth: 1, borderColor: '#aebbb5', borderRadius: 1, backgroundColor: '#e5eae4', alignItems: 'center', paddingVertical: 7, gap: 5 },
  activeRack: { borderColor: '#aa7b30', backgroundColor: '#f5ecd9' }, rackTitle: { color: '#586b62', fontWeight: '600', fontSize: 20 }, activeText: { color: '#76571f' },
  rackSlot: { flex: 1, width: '80%', borderWidth: 1, borderColor: '#c0cbc2', alignItems: 'center', justifyContent: 'center' },
  activeSlot: { backgroundColor: '#e4c892', borderColor: '#aa7b30' }, slotText: { color: '#687a70', fontSize: 10 }, target: { color: '#76571f', fontSize: 8, fontWeight: '600' },
  entrance: { position: 'absolute', bottom: 5, alignSelf: 'center', backgroundColor: '#f7f8f5', paddingHorizontal: 8, paddingVertical: 3 }, entranceText: { color: '#52666f', fontSize: 10 },
  person: { position: 'absolute', width: 18, height: 18, marginLeft: -9, marginTop: -9, borderRadius: 9, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#355b72', alignItems: 'center', justifyContent: 'center', zIndex: 3 },
  personDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#355b72' },
  destination: { position: 'absolute', width: 12, height: 12, marginLeft: -6, marginTop: -6, zIndex: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#aa7b30' },
  destinationDot: { width: 6, height: 6, backgroundColor: '#b58a42' },
  legend: { flexDirection: 'row', gap: 22, flexWrap: 'wrap', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e8ebe7' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 }, legendText: { color: '#69777e', fontSize: 11 },
  legendPerson: { width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: '#355b72' },
  legendRoute: { width: 16, height: 2, backgroundColor: '#a5b5be' }, legendTarget: { width: 9, height: 9, backgroundColor: '#d6b574', borderWidth: 1, borderColor: '#aa7b30' },
});
