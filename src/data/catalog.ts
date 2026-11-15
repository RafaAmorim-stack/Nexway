import { destinations, type DestinationId } from '../navigation/warehouseLayout';
export { markers, type MarkerId } from '../navigation/warehouseLayout';
export type Location = { id: DestinationId; label: string; shelf: 'A' | 'B'; module: number };
export type Item = { code: DestinationId; description: string; location: Location };
// Endereços confirmados; nomes de materiais ainda não fornecidos.
export const items: Item[] = destinations.map(d => ({
  code: d.id, description: 'Posição ' + d.id,
  location: { id: d.id, label: 'Prateleira ' + d.shelf, shelf: d.shelf, module: d.module },
}));
export function searchItems(query: string): Item[] {
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const q = normalize(query.trim());
  return items.filter(item => normalize(item.code + ' ' + item.description).includes(q));
}
