import type { Item, MarkerId } from '../data/catalog';
export type Phase = 'awaiting-start' | 'navigating' | 'arrived' | 'completed';
export type NavigationEvent = { type: 'start' | 'checkpoint' | 'wrong-marker' | 'arrival' | 'complete'; at: number; marker?: MarkerId };
export type Session = { item: Item; phase: Phase; startedAt: number; arrivedAt?: number; completedAt?: number; events: NavigationEvent[]; error?: string };
export function startSession(item: Item, now = Date.now()): Session {
  return { item, phase: 'awaiting-start', startedAt: now, events: [{ type: 'start', at: now }] };
}
export function recognize(state: Session, marker: MarkerId, now = Date.now()): Session {
  if (state.phase === 'completed' || state.phase === 'arrived') return state;
  const expected = state.phase === 'awaiting-start' ? 'START-01' : state.item.location.id;
  if (state.phase === 'navigating' && marker === 'START-01') return state;
  if (marker !== expected) {
    if (state.events.at(-1)?.type === 'wrong-marker' && state.events.at(-1)?.marker === marker) return state;
    return { ...state, error: `Marcador ${marker} incorreto. Procure ${expected}.`, events: [...state.events, { type: 'wrong-marker', marker, at: now }] };
  }
  const arrived = state.phase === 'navigating';
  return { ...state, error: undefined, phase: arrived ? 'arrived' : 'navigating', arrivedAt: arrived ? now : undefined,
    events: [...state.events, { type: arrived ? 'arrival' : 'checkpoint', marker, at: now }] };
}
export function complete(state: Session, now = Date.now()): Session {
  if (state.phase !== 'arrived') return state;
  return { ...state, phase: 'completed', completedAt: now, events: [...state.events, { type: 'complete', at: now }] };
}
export function metrics(state: Session) {
  return { item: state.item.code, destination: state.item.location.id, startedAt: state.startedAt, arrivedAt: state.arrivedAt,
    completedAt: state.completedAt, durationMs: state.completedAt === undefined ? null : state.completedAt - state.startedAt,
    errors: state.events.filter(e => e.type === 'wrong-marker').length, events: state.events };
}
