import { test } from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../src/data/catalog';
import { warehouse, isWalkable, routeToRack, instructionAt } from '../src/warehouse/layout';

test('cada material tem caminho válido da entrada à sua estante, sem atravessar estoque', () => {
  for (const item of items) {
    const route = routeToRack(item.location.id);
    const rack = warehouse.racks.find(r => r.id === item.location.id)!;
    assert.ok(route.length > 1);
    assert.deepEqual(route[0], warehouse.entrance);
    assert.deepEqual(route.at(-1), rack.approach);
    for (let i = 0; i < route.length; i++) {
      const point = route[i]!;
      assert.ok(isWalkable(point));
      if (i > 0) {
        const previous = route[i - 1]!;
        assert.equal(Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y), 1);
      }
    }
    assert.match(instructionAt(route, route.length - 1, item), new RegExp(`prateleira ${item.location.shelf}`));
    assert.ok(Number(item.location.sector) >= 1 && Number(item.location.sector) <= 3);
    assert.ok(item.location.shelf >= 1 && item.location.shelf <= 3);
  }
});
test('cada estante tem destino próprio e paredes e estantes são bloqueadas', () => {
  const destinations = warehouse.racks.map(r => JSON.stringify(routeToRack(r.id).at(-1)));
  assert.equal(new Set(destinations).size, warehouse.racks.length);
  assert.equal(isWalkable({ x: 0, y: 5 }), false);
  assert.equal(isWalkable({ x: 2, y: 3 }), false);
  assert.equal(isWalkable(warehouse.entrance), true);
});
