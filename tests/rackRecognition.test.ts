import { test } from 'node:test';
import assert from 'node:assert/strict';
import { items, type MarkerId } from '../src/data/catalog';
import { initialMaterialSession, materialSessionReducer as reduce, materialStatus } from '../src/navigation/materialSession';
import { materialMarker } from '../src/ar/materialMarker';
test('racks antes de START não avançam; START repetido é idempotente', () => {
  const initial = initialMaterialSession();
  assert.equal(reduce(initial, { type: 'recognize-rack', rack: 'RACK-A', at: 1 }), initial);
  assert.equal(materialMarker(initial, ['RACK-A']), undefined);
  const started = reduce(initial, { type: 'recognize-start' });
  assert.equal(reduce(started, { type: 'recognize-start' }), started);
  assert.equal(materialMarker(started, []), undefined);
  assert.equal(materialMarker(started, ['START-01']), undefined);
});
test('cada material rejeita os outros racks e registra chegada uma única vez no destino', () => {
  for (const item of items) {
    let session = reduce(initialMaterialSession(), { type: 'select', code: item.code });
    session = reduce(session, { type: 'recognize-start' });
    for (const other of items.filter(candidate => candidate !== item)) {
      session = reduce(session, { type: 'recognize-rack', rack: other.location.id, at: 10 });
      assert.equal(materialStatus(session).status, 'Estante incorreta');
      assert.equal(session.recognizedRack, other.location.id);
      assert.equal(session.arrivedAt, null);
      assert.equal(session.item, item);
      assert.equal(reduce(session, { type: 'recognize-rack', rack: other.location.id, at: 11 }), session);
    }
    const visible: MarkerId[] = ['RACK-A', 'RACK-B', 'RACK-C', 'START-01'];
    assert.equal(materialMarker(session, visible), item.location.id);
    session = reduce(session, { type: 'recognize-rack', rack: item.location.id, at: 20 });
    assert.equal(materialStatus(session).status, 'Estante correta reconhecida');
    assert.equal(session.arrivedAt, 20);
    assert.equal(materialMarker(session, visible), undefined);
    for (const rack of items) assert.equal(reduce(session, { type: 'recognize-rack', rack: rack.location.id, at: 30 }), session);
    assert.equal(reduce(session, { type: 'select', code: item.code }), session);
    const changed = reduce(session, { type: 'select', code: items.find(candidate => candidate !== item)!.code });
    assert.equal(changed.startRecognized, false);
    assert.equal(changed.recognizedRack, null);
    assert.equal(changed.arrivedAt, null);
  }
});
test('rack já visível é processado após START e perda não gera reconhecimento', () => {
  const initial = initialMaterialSession();
  assert.equal(materialMarker(initial, ['RACK-A', 'START-01']), 'START-01');
  const started = reduce(initial, { type: 'recognize-start' });
  assert.equal(materialMarker(started, ['RACK-A', 'START-01']), 'RACK-A');
  assert.equal(materialMarker(started, []), undefined);
});
