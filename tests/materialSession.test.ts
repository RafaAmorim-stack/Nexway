import { test } from 'node:test';
import assert from 'node:assert/strict';
import { items, searchItems } from '../src/data/catalog';
import { initialMaterialSession, materialSessionReducer, materialStatus } from '../src/navigation/materialSession';

test('busca e seleção resolvem cada material para seu rack após START', () => {
  for (const item of items) {
    const result = searchItems(item.code)[0]!;
    let session = materialSessionReducer(initialMaterialSession(), { type: 'select', code: result.code });
    assert.equal(materialStatus(session).status, 'Aguardando marcador START');
    session = materialSessionReducer(session, { type: 'recognize-start' });
    assert.deepEqual(materialStatus(session), {
      status: 'START reconhecido',
      material: `Material: ${item.code} · ${item.description}`,
      destination: `Destino: ${item.location.id}`,
    });
  }
});
test('troca de material reinicia START; seleção igual e anchors repetidos preservam confirmação', () => {
  const recognized = materialSessionReducer(initialMaterialSession(), { type: 'recognize-start' });
  assert.equal(materialSessionReducer(recognized, { type: 'recognize-start' }), recognized);
  assert.equal(materialSessionReducer(recognized, { type: 'select', code: recognized.item.code }), recognized);
  assert.equal(materialSessionReducer(recognized, { type: 'select', code: 'inexistente' }), recognized);
  const changed = materialSessionReducer(recognized, { type: 'select', code: 'MAT-002' });
  assert.equal(changed.startRecognized, false);
  assert.equal(materialStatus(changed).destination, 'Destino: RACK-B');
});
test('busca vazia lista catálogo; busca sem resultado não cria destino', () => {
  assert.deepEqual(searchItems('  '), items);
  assert.deepEqual(searchItems('inexistente'), []);
  assert.equal(searchItems(' PROTECAO ')[0]?.location.id, 'RACK-B');
});
