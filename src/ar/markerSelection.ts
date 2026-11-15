import { START_TARGET } from '../navigation/warehouseLayout';
import type { MarkerId } from '../data/catalog';
import type { Session } from '../navigation/session';

// Prefer the expected checkpoint if several markers are visible at once.
export function markerForSession(session: Session, visible: readonly MarkerId[]): MarkerId | undefined {
  if (session.phase === 'arrived' || session.phase === 'completed') return undefined;
  const expected = session.phase === 'awaiting-start' ? START_TARGET : session.item.location.id;
  if (visible.includes(expected)) return expected;
  return visible.find(id => !(session.phase === 'navigating' && id === START_TARGET));
}
