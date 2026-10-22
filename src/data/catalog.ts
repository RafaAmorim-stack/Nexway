export type MarkerId = 'START-01' | 'RACK-A' | 'RACK-B' | 'RACK-C';
export type Location = { id: Exclude<MarkerId, 'START-01'>; label: string; sector: string; shelf: number };
export type Item = { code: string; description: string; location: Location };
// Dados de demonstração; substituir pelo catálogo real antes do piloto.
export const items: Item[] = [
  { code: 'MAT-001', description: 'Parafuso sextavado M8', location: { id: 'RACK-A', label: 'Estante A', sector: '02', shelf: 2 } },
  { code: 'MAT-002', description: 'Luva de proteção', location: { id: 'RACK-B', label: 'Estante B', sector: '01', shelf: 1 } },
  { code: 'MAT-003', description: 'Rolamento industrial', location: { id: 'RACK-C', label: 'Estante C', sector: '03', shelf: 3 } },
];
export const markers: MarkerId[] = ['START-01', 'RACK-A', 'RACK-B', 'RACK-C'];
export function searchItems(query: string): Item[] {
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const q = normalize(query.trim());
  return items.filter(item => normalize(item.code + ' ' + item.description).includes(q));
}
