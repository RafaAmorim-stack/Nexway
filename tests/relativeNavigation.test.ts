import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialNavigation, navigationReducer as reduce, relativePosition, relativeHeading, distanceBetween, guidance, checkpointPosition, CHECKPOINT_TOLERANCE, type Pose } from '../src/navigation/relativeNavigation';
import { materialRoute } from '../src/navigation/materialRoute';
import { initialMaterialSession, materialSessionReducer } from '../src/navigation/materialSession';
const origin: Pose = { position: [10, 1.6, 20], forward: [0, 0, -1] };
const pose = (x: number, z: number, forward: number[] = [0, 0, -1]): Pose => ({ position: [10 + x, 1.6, 20 - z], forward });
const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9, actual + ' != ' + expected);
const route = materialRoute(materialSessionReducer(initialMaterialSession(), { type: 'recognize-start' }))!;
test('posição relativa remove translação, ignora altura e respeita orientação inicial', () => {
  assert.deepEqual(relativePosition(origin, origin), { x: 0, z: 0 });
  assert.deepEqual(relativePosition(origin, pose(2, 3)), { x: 2, z: 3 });
  assert.deepEqual(relativePosition(origin, { position: [12, 9, 17], forward: [0, 0, -1] }), { x: 2, z: 3 });
  const east: Pose = { position: [4, 2, 9], forward: [1, 0, 0] };
  assert.deepEqual(relativePosition(east, { position: [7, 2, 11], forward: [1, 0, 0] }), { x: 2, z: 3 });
  close(relativeHeading(origin, pose(0, 0, [1, 0, 0])), Math.PI / 2);
  close(relativeHeading(origin, pose(0, 0, [-1, 0, 0])), -Math.PI / 2);
});
test('distância euclidiana e conversão da grade para metros', () => {
  assert.equal(distanceBetween({ x: 0, z: 0 }, { x: 3, z: 4 }), 5);
  assert.deepEqual(checkpointPosition(route.checkpoints[1]!), { x: 0, z: 3 });
  assert.equal(distanceBetween({ x: 2, z: 2 }, { x: 2, z: 2 }), 0);
});
test('escolhe próximo checkpoint e calcula direção no referencial atual da câmera', () => {
  const state = reduce(initialNavigation('MAT-001'), { type: 'calibrate', pose: origin });
  assert.equal(guidance(state, route.checkpoints)!.checkpoint.label, 'Corredor principal');
  assert.equal(guidance(state, route.checkpoints)!.distance, 3);
  assert.equal(guidance(state, route.checkpoints)!.direction, 'Siga em frente');
  assert.equal(guidance({ ...state, heading: Math.PI / 2 }, route.checkpoints)!.direction, 'Vire à esquerda');
  assert.equal(guidance({ ...state, heading: -Math.PI / 2 }, route.checkpoints)!.direction, 'Vire à direita');
  assert.equal(guidance({ ...state, heading: Math.PI }, route.checkpoints)!.direction, 'Vire para trás');
  close(guidance({ ...state, heading: 2 * Math.PI - 0.1 }, route.checkpoints)!.angle, 0.1 * 180 / Math.PI);
});
test('avança apenas dentro da tolerância e na ordem; não pula checkpoint', () => {
  let state = reduce(initialNavigation('MAT-001'), { type: 'calibrate', pose: origin });
  state = reduce(state, { type: 'pose', pose: pose(0, 1.5), checkpoints: route.checkpoints });
  state = reduce(state, { type: 'pose', pose: pose(0, 3 - CHECKPOINT_TOLERANCE - 0.01), checkpoints: route.checkpoints });
  assert.equal(state.nextIndex, 1);
  state = reduce(state, { type: 'pose', pose: pose(0, 3 - CHECKPOINT_TOLERANCE + 0.01), checkpoints: route.checkpoints });
  assert.equal(state.nextIndex, 2);
  assert.equal(guidance(state, route.checkpoints)!.checkpoint.label, 'Corredor A');
  state = reduce(state, { type: 'pose', pose: pose(0, 3), checkpoints: route.checkpoints });
  assert.equal(state.nextIndex, 2);
});
test('percorre todos os checkpoints dos três materiais sem confirmar chegada automaticamente', () => {
  for (const code of ['MAT-001', 'MAT-002', 'MAT-003']) {
    let session = materialSessionReducer(initialMaterialSession(), { type: 'select', code });
    session = materialSessionReducer(session, { type: 'recognize-start' });
    const plan = materialRoute(session)!;
    let state = reduce(initialNavigation(code), { type: 'calibrate', pose: origin });
    for (let i = 1; i < plan.points.length; i++) {
      const p = checkpointPosition({ label: '', point: plan.points[i]! });
      state = reduce(state, { type: 'pose', pose: pose(p.x, p.z), checkpoints: plan.checkpoints });
    }
    assert.equal(state.nextIndex, plan.checkpoints.length);
    assert.equal(guidance(state, plan.checkpoints), null);
    assert.equal(session.arrivedAt, null);
    const wrong = code === 'MAT-001' ? 'RACK-B' : 'RACK-A';
    session = materialSessionReducer(session, { type: 'recognize-rack', rack: wrong, at: 1 });
    assert.equal(session.arrivedAt, null);
    session = materialSessionReducer(session, { type: 'recognize-rack', rack: session.item.location.id, at: 2 });
    assert.equal(session.arrivedAt, 2);
  }
});
test('perda de tracking, pose inválida e salto suspendem a orientação e exigem novo START', () => {
  const calibrated = reduce(initialNavigation('MAT-001'), { type: 'calibrate', pose: origin });
  const lost = reduce(calibrated, { type: 'lost' });
  assert.equal(lost.origin, null);
  assert.equal(lost.position, null);
  assert.equal(guidance(lost, route.checkpoints), null);
  assert.equal(reduce(lost, { type: 'pose', pose: origin, checkpoints: route.checkpoints }), lost);
  for (const invalid of [pose(NaN, 0), pose(0, Infinity), pose(0, 0, [0, 1, 0]), pose(0, 0, [0, 0]), pose(3, 0)]) {
    assert.equal(reduce(calibrated, { type: 'pose', pose: invalid, checkpoints: route.checkpoints }).origin, null);
  }
  const recalibrated = reduce(lost, { type: 'calibrate', pose: pose(1, 1) });
  assert.deepEqual(recalibrated.position, { x: 0, z: 0 });
  assert.equal(recalibrated.nextIndex, 1);
  assert.equal(reduce(calibrated, { type: 'calibrate', pose: pose(1, 1) }), calibrated);
});
test('troca de material reinicia origem, posição e checkpoint; mesmo material preserva navegação', () => {
  let state = reduce(initialNavigation('MAT-001'), { type: 'calibrate', pose: origin });
  state = reduce(state, { type: 'pose', pose: pose(0, 1.5), checkpoints: route.checkpoints });
  assert.equal(reduce(state, { type: 'select', code: 'MAT-001' }), state);
  assert.deepEqual(reduce(state, { type: 'select', code: 'MAT-002' }), initialNavigation('MAT-002'));
});
