import { test } from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../src/data/catalog';
import { recognize, startSession } from '../src/navigation/session';
import { markerForSession } from '../src/ar/markerSelection';

test('prioriza START quando há estantes visíveis antes do início', () => {
  const session = startSession(items[0]!, 0);
  assert.equal(markerForSession(session, ['RACK-B', 'RACK-A', 'START-01']), 'START-01');
});
test('aceita a estante já visível após reconhecer START, sem depender de novo onAnchorFound', () => {
  const session = recognize(startSession(items[0]!, 0), 'START-01', 1);
  const marker = markerForSession(session, ['RACK-B', 'RACK-A', 'START-01']);
  assert.equal(marker, 'RACK-A');
  assert.equal(recognize(session, marker!, 2).phase, 'arrived');
});
test('perda do marcador não avança e estantes erradas continuam gerando erro', () => {
  const session = recognize(startSession(items[0]!, 0), 'START-01', 1);
  assert.equal(markerForSession(session, []), undefined);
  assert.equal(markerForSession(session, ['START-01']), undefined);
  assert.equal(markerForSession(session, ['RACK-B']), 'RACK-B');
  assert.match(recognize(session, 'RACK-B', 2).error!, /incorreto/);
  const arrived = recognize(session, 'RACK-A', 3);
  assert.equal(markerForSession(arrived, ['RACK-A']), undefined);
});
