import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { destinations, shelves, start, METERS_PER_CELL, markers, START_TARGET } from '../src/navigation/warehouseLayout';
import { isWalkable, routeToDestination } from '../src/warehouse/layout';
import { items, searchItems } from '../src/data/catalog';
import { initialMaterialSession, materialSessionReducer as reduce, canValidateRack } from '../src/navigation/materialSession';
import { materialMarker } from '../src/ar/materialMarker';
import { materialRoute } from '../src/navigation/materialRoute';
import { checkpointPosition } from '../src/navigation/relativeNavigation';
import { completeRoute, origin, poseAt } from './helpers/materialJourney';

test('geometria medida: 1 m/célula, A/B 12×1, quatro módulos 3 m, START 3 m e corredor 2 m', () => {
  assert.equal(METERS_PER_CELL, 1);
  assert.deepEqual(start, { x: 6, y: 0 });
  assert.equal(shelves.length, 2);
  for (const shelf of shelves) {
    assert.equal(shelf.width, 12); assert.equal(shelf.height, 1);
    assert.equal(shelf.modules, 4); assert.equal(shelf.moduleWidth, 3);
    for (let x = 0; x < 12; x++) assert.equal(isWalkable({ x, y: shelf.y }), false);
  }
  assert.equal(shelves[0].y - start.y, 3);
  assert.equal(shelves[1].y - (shelves[0].y + shelves[0].height), 2);
  for (let x = 0; x < 12; x++) for (const y of [4, 5]) assert.equal(isWalkable({ x, y }), true);
});

test('somente quatro posições confirmadas, com módulos e access points próprios', () => {
  assert.deepEqual(destinations.map(d => [d.id, d.shelf, d.module]), [
    ['SF01001A', 'A', 1], ['SF01014A', 'A', 3], ['SF01009B', 'B', 1], ['SF01012B', 'B', 3],
  ]);
  assert.equal(items.length, 4);
  assert.deepEqual(markers, [START_TARGET, ...destinations.map(d => d.id)]);
  for (const d of destinations) {
    assert.equal(searchItems('  ' + d.id.toLowerCase() + '  ')[0]!.code, d.id);
    assert.equal(items.find(i => i.code === d.id)!.description, 'Posição ' + d.id);
    assert.equal(d.markerTarget, d.id);
    assert.ok(isWalkable(d.accessPoint));
    assert.equal(d.markerPosition.x, (d.module - 1) * 3 + 1.5);
    assert.ok(d.accessPoint.x >= (d.module - 1) * 3 && d.accessPoint.x < d.module * 3);
  }
});

for (const d of destinations) test('BFS mínimo e ortogonal, livre de A/B: ' + d.id, () => {
  const route = routeToDestination(d.id);
  assert.deepEqual(route.at(-1), d.accessPoint);
  assert.ok(route.every(isWalkable));
  for (let i = 1; i < route.length; i++) assert.equal(Math.abs(route[i]!.x - route[i-1]!.x) + Math.abs(route[i]!.y - route[i-1]!.y), 1);
  if (d.shelf === 'B') {
    assert.ok(route.some(p => p.y === 3 && (p.x < 0 || p.x >= 12)), 'deve cruzar a profundidade da A pela lateral');
    assert.ok(route.some(p => p.y === 5 && p.x >= 0 && p.x < 12));
    // Mínimo Manhattan via cada extremidade livre, independente do BFS.
    const expected = Math.min(...[-1, 12].map(x => Math.abs(start.x - x) + Math.abs(d.accessPoint.x - x) + 5));
    assert.equal(route.length - 1, expected);
  } else assert.equal(route.length - 1, Math.abs(start.x - d.accessPoint.x) + 2);
});

test('todos os pares: etiqueta incorreta da mesma/outra prateleira nunca valida', () => {
  for (const d of destinations) {
    const selected = reduce(initialMaterialSession(), { type: 'select', code: d.id });
    for (const state of [selected, reduce(selected, { type: 'calibrate', pose: origin }), completeRoute(selected)]) {
      for (const wrong of destinations.filter(other => other.id !== d.id)) {
        assert.equal(reduce(state, { type: 'recognize-rack', rack: wrong.id, at: 10 }).arrivedAt, null);
      }
    }
    const ready = completeRoute(selected);
    assert.equal(materialMarker(ready, markers), d.id);
    const arrived = reduce(ready, { type: 'recognize-rack', rack: d.id, at: 11 });
    assert.equal(arrived.arrivedAt, 11);
    assert.equal(reduce(arrived, { type: 'recognize-rack', rack: d.id, at: 12 }), arrived);
  }
});

test('contornar A exige checkpoints em ordem mesmo vendo o destino B antecipadamente', () => {
  let s = reduce(initialMaterialSession(), { type: 'select', code: 'SF01012B' });
  s = reduce(s, { type: 'calibrate', pose: origin });
  const plan = materialRoute(s)!;
  assert.ok(plan.checkpoints.length >= 4);
  // Alcança o ponto final por um trajeto amostrado que evita o primeiro checkpoint.
  const target = checkpointPosition(plan.checkpoints.at(-1)!);
  for (let x = 1; x <= target.x; x++) s = reduce(s, { type: 'pose', pose: poseAt(x, 0) });
  for (let z = 1; z <= target.z; z++) s = reduce(s, { type: 'pose', pose: poseAt(target.x, z) });
  assert.equal(s.navigation.nextIndex, 1);
  assert.equal(canValidateRack(s), false);
  assert.equal(reduce(s, { type: 'recognize-rack', rack: 'SF01012B', at: 1 }).arrivedAt, null);
});

test('tracking perdido exige START e percurso completo novamente para os quatro destinos', () => {
  for (const d of destinations) {
    const ready = completeRoute(reduce(initialMaterialSession(), { type: 'select', code: d.id }));
    const lost = reduce(ready, { type: 'navigation-lost' });
    assert.equal(lost.startRecognized, false);
    assert.equal(materialRoute(lost), null);
    assert.equal(materialMarker(lost, [d.id]), undefined);
    assert.equal(reduce(lost, { type: 'pose', pose: origin }), lost);
    const recalibrated = reduce(lost, { type: 'calibrate', pose: origin });
    assert.equal(recalibrated.navigation.nextIndex, 1);
    assert.equal(canValidateRack(recalibrated), false);
  }
});

test('cinco targets reais distintos e evidências existem; nenhum asset antigo cadastrado', () => {
  const names = ['start-huawei', ...destinations.map(d => d.id)];
  const hashes = names.map(name => {
    assert.ok(existsSync('docs/images/huawei/' + name + '.jpg'));
    const bytes = readFileSync('assets/markers/huawei/' + name + '.png');
    assert.equal(bytes.readUInt32BE(16), 512); assert.equal(bytes.readUInt32BE(20), 512);
    return createHash('sha256').update(bytes).digest('hex');
  });
  assert.equal(new Set(hashes).size, 5);
  const source = readFileSync('src/ar/huaweiTargets.ts', 'utf8');
  for (const name of names) assert.ok(source.includes('/huawei/' + name + '.png'));
  assert.equal(/RACK-|START-01/.test(source), false);
});
