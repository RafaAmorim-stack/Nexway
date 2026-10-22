import { test } from 'node:test';
import assert from 'node:assert/strict';
import { items, searchItems } from '../src/data/catalog';
import { startSession, recognize, complete, metrics } from '../src/navigation/session';
const item = items[0]!;
test('fluxo completo registra duração e ignora marcadores após conclusão', () => {
 let s = startSession(item, 1000);
 s = recognize(s, 'START-01', 2000);
 assert.equal(s.phase, 'navigating');
 s = recognize(s, 'RACK-A', 4000);
 assert.equal(s.phase, 'arrived');
 s = complete(s, 5000);
 assert.equal(metrics(s).durationMs, 4000);
 assert.equal(recognize(s, 'RACK-B', 6000), s);
});
test('estante antes do START e estante errada não avançam', () => {
 let s = recognize(startSession(item, 0), 'RACK-A', 1);
 assert.equal(s.phase, 'awaiting-start');
 assert.ok(s.error);
 s = recognize(s, 'START-01', 2);
 s = recognize(s, 'RACK-B', 3);
 assert.equal(s.phase, 'navigating');
 assert.equal(metrics(s).errors, 2);
 assert.equal(recognize(s, 'RACK-B', 4).events.length, s.events.length);
 assert.equal(complete(s), s);
 s = recognize(s, 'RACK-A', 5);
 assert.equal(s.error, undefined);
});
test('busca aceita código, acentos e espaços', () => {
 assert.equal(searchItems(' PROTECAO ')[0]?.code, 'MAT-002');
 assert.equal(searchItems('mat-001').length, 1);
 assert.equal(searchItems('inexistente').length, 0);
});
