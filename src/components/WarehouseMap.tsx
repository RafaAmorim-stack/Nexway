import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Item, Location } from '../data/catalog';
import { warehouse, destinations, type Point } from '../navigation/warehouseLayout';

type Props = { item: Item; route: Point[]; step: number; onSelectRack?: (id: Location['id']) => void; planning?: boolean };
const b = warehouse.bounds;
const left = (x: number): `${number}%` => `${(x - b.minX) * 100 / warehouse.columns}%`;
const top = (y: number): `${number}%` => `${(b.maxY + 1 - y) * 100 / warehouse.rows}%`;
export function WarehouseMap({ item, route, step, onSelectRack, planning = false }: Props) {
  const position = route[step] ?? warehouse.entrance;
  return <View style={styles.frame}>
    <View style={styles.topline}><Text style={styles.small}>Huawei · planta do ambiente</Text><Text style={styles.small}>1 quadrado = 1 m</Text></View>
    <View style={styles.map} accessibilityLabel={planning ? 'Rota planejada para ' + item.code + '. Sem posição ao vivo.' : 'Simulação para ' + item.code}>
      {Array.from({ length: warehouse.columns * warehouse.rows }, (_, i) => <View key={i} style={[styles.tile, {
        left: `${(i % warehouse.columns) * 100 / warehouse.columns}%`, top: `${Math.floor(i / warehouse.columns) * 100 / warehouse.rows}%`,
        width: `${100 / warehouse.columns}%`, height: `${100 / warehouse.rows}%`,
      }]} />)}
      {route.slice(0, -1).map((point, i) => {
        const next = route[i + 1]!;
        const horizontal = point.y === next.y;
        return <View key={i} style={[styles.line, {
          left: left(Math.min(point.x, next.x)), top: top(Math.max(point.y, next.y)),
          width: horizontal ? `${100 / warehouse.columns}%` : 3,
          height: horizontal ? 3 : `${100 / warehouse.rows}%`,
          backgroundColor: i < step ? '#29485c' : '#b58a42',
        }]} />;
      })}
      {warehouse.racks.map(rack => <View key={rack.id} style={[styles.rack, {
        left: left(rack.x), top: top(rack.y + rack.height), width: `${rack.width * 100 / warehouse.columns}%`, height: `${rack.height * 100 / warehouse.rows}%`,
      }]}>
        {Array.from({ length: rack.modules }, (_, index) => {
          const module = index + 1;
          const destination = destinations.find(d => d.shelf === rack.id && d.module === module);
          const active = destination?.id === item.code;
          return <Pressable key={module} disabled={!destination || !onSelectRack}
            accessibilityRole={destination && onSelectRack ? 'button' : 'image'} accessibilityState={{ selected: active }}
            accessibilityLabel={rack.id + ' módulo ' + module + (destination ? ' ' + destination.id : ', sem endereço cadastrado')}
            onPress={() => destination && onSelectRack?.(destination.id)} style={[styles.module, active && styles.active]}>
            <Text style={[styles.moduleText, active && styles.activeText]}>{rack.id} · M{module}</Text>
          </Pressable>;
        })}
      </View>)}
      <Text style={[styles.dimension, { left: left(3), top: top(8) }]}>12 m · 4 módulos de 3 m</Text>
      <Text style={[styles.dimension, { left: left(4), top: top(5.6) }]}>Corredor livre · 2 m</Text>
      <Text style={[styles.dimension, { left: left(8), top: top(1.2) }]}>START → A: 3 m</Text>
      <Text style={[styles.start, { left: left(warehouse.entrance.x), top: top(warehouse.entrance.y) }]}>START</Text>
      {!planning && <View style={[styles.person, { left: left(position.x), top: top(position.y) }]} />}
      {route.length > 0 && <View style={[styles.destination, { left: left(route.at(-1)!.x), top: top(route.at(-1)!.y) }]} />}
    </View>
    <View style={styles.addresses}>{destinations.map(d => <Pressable key={d.id} disabled={!onSelectRack} onPress={() => onSelectRack?.(d.id)}
      accessibilityRole={onSelectRack ? 'button' : 'text'} accessibilityState={{ selected: d.id === item.code }}
      style={[styles.address, d.id === item.code && styles.active]}>
      <Text style={styles.addressText}>{d.id}</Text><Text style={styles.small}>{d.shelf} · Módulo {d.module}</Text>
    </Pressable>)}</View>
    <Text style={styles.small}>{planning ? 'Plano estático' : 'Simulação'} · linha: percurso · quadrado: acesso ao endereço</Text>
  </View>;
}
const styles = StyleSheet.create({
  frame: { padding: 12, borderRadius: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d5dbd9', gap: 12 },
  topline: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }, small: { color: '#586b75', fontSize: 11 },
  map: { width: '100%', aspectRatio: warehouse.columns / warehouse.rows, backgroundColor: '#f7f8f5', borderWidth: 1, borderColor: '#d5dcd7' },
  tile: { position: 'absolute', borderWidth: 0.5, borderColor: '#e0e7e4' }, line: { position: 'absolute', marginLeft: -1.5, marginTop: -1.5 },
  rack: { position: 'absolute', flexDirection: 'row', backgroundColor: '#dfe8ed' },
  module: { flex: 1, borderWidth: 1, borderColor: '#8196a3', alignItems: 'center', justifyContent: 'center' },
  moduleText: { fontSize: 10, color: '#29485c', fontWeight: '600' }, active: { backgroundColor: '#f5dfb3', borderColor: '#aa7b30' }, activeText: { color: '#65450e' },
  dimension: { position: 'absolute', fontSize: 9, color: '#546870' },
  start: { position: 'absolute', marginLeft: -17, marginTop: 8, fontSize: 10, fontWeight: '700', color: '#29485c' },
  person: { position: 'absolute', marginLeft: -5, marginTop: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#29485c', borderWidth: 2, borderColor: '#fff' },
  destination: { position: 'absolute', marginLeft: -4, marginTop: -4, width: 8, height: 8, borderWidth: 2, borderColor: '#996d29', backgroundColor: '#fff' },
  addresses: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, address: { width: '48%', padding: 8, gap: 3, borderWidth: 1, borderColor: '#d5dbd9' }, addressText: { color: '#29485c', fontWeight: '600', fontSize: 12 },
});
