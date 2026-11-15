import { test } from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../src/data/catalog';
import { warehouse, isWalkable, routeToDestination, instructionAt } from '../src/warehouse/layout';
import { destinations } from '../src/navigation/warehouseLayout';

test('cada endereço tem caminho válido do START ao acesso, sem atravessar estoque', () => {
  for (const item of items) {
    const route = routeToDestination(item.code);
    assert.ok(route.length > 1);
    assert.deepEqual(route[0], warehouse.entrance);
    assert.deepEqual(route.at(-1), destinations.find(d => d.id === item.code)!.accessPoint);
    for (let i = 0; i < route.length; i++) {
      assert.ok(isWalkable(route[i]!));
      if (i > 0) assert.equal(Math.abs(route[i]!.x - route[i-1]!.x) + Math.abs(route[i]!.y - route[i-1]!.y), 1);
    }
    assert.match(instructionAt(route, route.length - 1, item), new RegExp(item.code));
    assert.match(instructionAt(route, route.length - 1, item), new RegExp('módulo ' + item.location.module));
  }
});
test('cada endereço tem acesso próprio; limites e prateleiras são bloqueados', () => {
  assert.equal(new Set(destinations.map(d => JSON.stringify(routeToDestination(d.id).at(-1)))).size, 4);
  assert.equal(isWalkable({ x: -3, y: 5 }), false);
  assert.equal(isWalkable({ x: 2, y: 3 }), false);
  assert.equal(isWalkable({ x: 2, y: 6 }), false);
  assert.equal(isWalkable(warehouse.entrance), true);
});
