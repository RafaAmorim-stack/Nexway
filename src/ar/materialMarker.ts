import { START_TARGET } from '../navigation/warehouseLayout';
import type { MarkerId } from '../data/catalog';
import { canValidateRack, type MaterialSession } from '../navigation/materialSession';
export function materialMarker(session: MaterialSession, visible: readonly MarkerId[]): MarkerId | undefined {
  if (session.arrivedAt !== null) return undefined;
  if (!session.startRecognized) return visible.includes(START_TARGET) ? START_TARGET : undefined;
  if (canValidateRack(session) && visible.includes(session.item.location.id)) return session.item.location.id;
  return visible.find(id => id !== START_TARGET && id !== session.item.location.id);
}
