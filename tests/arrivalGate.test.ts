import { test } from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../src/data/catalog';
import { initialMaterialSession, materialSessionReducer as reduce, canValidateRack } from '../src/navigation/materialSession';
import { materialMarker } from '../src/ar/materialMarker';
import { materialRoute } from '../src/navigation/materialRoute';
import { checkpointPosition } from '../src/navigation/relativeNavigation';
import { completeRoute, origin, poseAt } from './helpers/materialJourney';

test('START e rack correto antes dos checkpoints não registram chegada para nenhum material', () => {
  for (const item of items) {
    let s = reduce(initialMaterialSession(), { type: 'select', code: item.code });
    s = reduce(s, { type: 'recognize-start' });
    assert.equal(reduce(s, { type: 'recognize-rack', rack: item.location.id, at: 1 }), s);
    s = reduce(s, { type: 'calibrate', pose: origin });
    assert.equal(canValidateRack(s), false);
    assert.equal(materialMarker(s, [item.location.id]), undefined);
    assert.equal(reduce(s, { type: 'recognize-rack', rack: item.location.id, at: 2 }), s);
    assert.equal(s.arrivedAt, null);
    for (const point of materialRoute(s)!.points.slice(1, -1)) {
      const p = checkpointPosition({ label: '', point });
      s = reduce(s, { type: 'pose', pose: poseAt(p.x, p.z) });
      assert.equal(canValidateRack(s), false);
      assert.equal(reduce(s, { type: 'recognize-rack', rack: item.location.id, at: 3 }), s);
    }
  }
});

test('último checkpoint libera rack já visível; chegada é registrada uma única vez', () => {
  const s = completeRoute(initialMaterialSession());
  assert.equal(canValidateRack(s), true);
  assert.equal(s.arrivedAt, null);
  assert.equal(materialMarker(s, ['RACK-A']), 'RACK-A');
  const arrived = reduce(s, { type: 'recognize-rack', rack: 'RACK-A', at: 10 });
  assert.equal(arrived.arrivedAt, 10);
  assert.equal(reduce(arrived, { type: 'recognize-rack', rack: 'RACK-A', at: 20 }), arrived);
  assert.equal(reduce(arrived, { type: 'navigation-lost' }), arrived);
});

test('rack incorreto não registra chegada antes nem depois dos checkpoints', () => {
  const started = reduce(initialMaterialSession(), { type: 'calibrate', pose: origin });
  for (const s of [started, completeRoute(initialMaterialSession())]) {
    const wrong = reduce(s, { type: 'recognize-rack', rack: 'RACK-B', at: 1 });
    assert.equal(wrong.arrivedAt, null);
    assert.equal(wrong.recognizedRack, 'RACK-B');
  }
});

test('não permite pular checkpoint mesmo chegando gradualmente a um checkpoint posterior', () => {
  let s = reduce(initialMaterialSession(), { type: 'calibrate', pose: origin });
  // Desvia do primeiro checkpoint (0,3) e alcança o segundo (1,3).
  for (const [x, z] of [[1, 0], [1, 1], [1, 2], [1, 3]]) {
    s = reduce(s, { type: 'pose', pose: poseAt(x!, z!) });
  }
  assert.equal(s.navigation.nextIndex, 1);
  assert.equal(canValidateRack(s), false);
  assert.equal(reduce(s, { type: 'recognize-rack', rack: 'RACK-A', at: 1 }).arrivedAt, null);
});

test('perda de tracking, pose inválida, salto e troca de material revogam liberação do rack', () => {
  const ready = completeRoute(initialMaterialSession());
  for (const action of [
    { type: 'navigation-lost' } as const,
    { type: 'pose', pose: poseAt(NaN, 0) } as const,
    { type: 'pose', pose: poseAt(100, 100) } as const,
    { type: 'select', code: 'MAT-002' } as const,
  ]) {
    const reset = reduce(ready, action);
    assert.equal(canValidateRack(reset), false);
    assert.equal(reset.startRecognized, false);
    assert.equal(reduce(reset, { type: 'recognize-rack', rack: reset.item.location.id, at: 1 }).arrivedAt, null);
    const recalibrated = reduce(reset, { type: 'calibrate', pose: origin });
    assert.equal(recalibrated.navigation.nextIndex, 1);
    assert.equal(canValidateRack(recalibrated), false);
  }
});
