import { test } from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../src/data/catalog';
import { initialMaterialSession, materialSessionReducer as reduce } from '../src/navigation/materialSession';
import { materialRoute } from '../src/navigation/materialRoute';
import { warehouse, isWalkable } from '../src/warehouse/layout';
test('rota só é liberada após START para cada material e termina no acesso do rack', () => {
  for (const item of items) {
    const selected = reduce(initialMaterialSession(), { type: 'select', code: item.code });
    assert.equal(materialRoute(selected), null);
    const route = materialRoute(reduce(selected, { type: 'recognize-start' }))!;
    assert.deepEqual(route.points[0], warehouse.entrance);
    assert.deepEqual(route.points.at(-1), warehouse.racks.find(rack => rack.id === item.location.id)!.approach);
    const labels = ['START', 'Corredor principal', 'Corredor ' + item.location.id.slice(-1)];
    if (item.location.id === 'RACK-A') labels.push('Acesso à estante A');
    labels.push(item.location.id);
    assert.deepEqual(route.checkpoints.map(checkpoint => checkpoint.label), labels);
    assert.match(route.nextInstruction, /Siga em frente até Corredor principal/);
    assert.match(route.nextInstruction, new RegExp(item.location.id));
    for (let i = 0; i < route.points.length; i++) {
      const point = route.points[i]!;
      assert.ok(isWalkable(point));
      assert.ok(point.x > 0 && point.x < warehouse.columns - 1 && point.y > 0 && point.y < warehouse.rows - 1);
      assert.ok(!warehouse.racks.some(rack => point.x >= rack.x && point.x < rack.x + rack.width && point.y >= rack.y && point.y < rack.y + rack.height));
      if (i > 0) assert.equal(Math.abs(point.x - route.points[i - 1]!.x) + Math.abs(point.y - route.points[i - 1]!.y), 1);
    }
    // Cada segmento resumido corresponde exatamente às células da rota, sem cortar obstáculos.
    const expanded = [route.checkpoints[0]!.point];
    for (let i = 1; i < route.checkpoints.length; i++) {
      let point = expanded.at(-1)!;
      const end = route.checkpoints[i]!.point;
      assert.ok(point.x === end.x || point.y === end.y);
      while (point.x !== end.x || point.y !== end.y) {
        point = { x: point.x + Math.sign(end.x - point.x), y: point.y + Math.sign(end.y - point.y) };
        expanded.push(point);
      }
    }
    assert.deepEqual(expanded, route.points);
  }
});
test('troca de material exige novo START e recalcula rota e instrução para o novo destino', () => {
  let session = reduce(initialMaterialSession(), { type: 'recognize-start' });
  const original = materialRoute(session)!;
  for (const code of ['MAT-002', 'MAT-003', 'MAT-001']) {
    session = reduce(session, { type: 'select', code });
    assert.equal(materialRoute(session), null);
    session = reduce(session, { type: 'recognize-start' });
    const route = materialRoute(session)!;
    assert.equal(route.checkpoints.at(-1)!.label, session.item.location.id);
    if (code === 'MAT-002') assert.notDeepEqual(route.points, original.points);
    assert.equal(session.arrivedAt, null);
  }
});
test('calcular rota e reconhecer rack errado não concluem; rack correto valida chegada', () => {
  const started = reduce(initialMaterialSession(), { type: 'recognize-start' });
  const route = materialRoute(started)!;
  assert.equal(started.arrivedAt, null);
  const wrong = reduce(started, { type: 'recognize-rack', rack: 'RACK-B', at: 10 });
  assert.equal(wrong.arrivedAt, null);
  assert.deepEqual(materialRoute(wrong), route);
  const arrived = reduce(wrong, { type: 'recognize-rack', rack: 'RACK-A', at: 20 });
  assert.equal(arrived.arrivedAt, 20);
  assert.deepEqual(materialRoute(arrived)!.points, route.points);
  assert.equal(materialRoute(arrived)!.nextInstruction, 'Chegada validada pelo marcador RACK-A.');
});
