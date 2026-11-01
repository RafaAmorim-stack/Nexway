import type { MarkerId } from '../data/catalog';
import { canValidateRack, type MaterialSession } from '../navigation/materialSession';
export function materialMarker(session: MaterialSession, visible: readonly MarkerId[]): MarkerId | undefined {
  if (session.arrivedAt !== null) return undefined;
  if (!session.startRecognized) return visible.includes('START-01') ? 'START-01' : undefined;
  if (canValidateRack(session) && visible.includes(session.item.location.id)) return session.item.location.id;
  return visible.find(id => id !== 'START-01' && id !== session.item.location.id);
}
