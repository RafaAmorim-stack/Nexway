import type { Item, Location } from '../data/catalog';

export type Point = { x: number; y: number };
export type Rack = { id: Location['id']; label: string; x: number; y: number; width: number; height: number; approach: Point };
export const warehouse = {
  columns: 15,
  rows: 13,
  entrance: { x: 7, y: 11 },
  racks: [
    { id: 'RACK-A', label: 'A', x: 2, y: 2, width: 2, height: 6, approach: { x: 4, y: 4 } },
    { id: 'RACK-B', label: 'B', x: 6, y: 2, width: 2, height: 6, approach: { x: 8, y: 4 } },
    { id: 'RACK-C', label: 'C', x: 10, y: 2, width: 2, height: 6, approach: { x: 12, y: 4 } },
  ] satisfies Rack[],
};
export function isWalkable(point: Point): boolean {
  return point.x > 0 && point.x < warehouse.columns - 1 && point.y > 0 && point.y < warehouse.rows - 1 &&
    !warehouse.racks.some(r => point.x >= r.x && point.x < r.x + r.width && point.y >= r.y && point.y < r.y + r.height);
}
export function routeToRack(id: Location['id']): Point[] {
  const target = warehouse.racks.find(r => r.id === id)?.approach;
  if (!target) return [];
  const key = (p: Point) => `${p.x},${p.y}`;
  const queue: Point[][] = [[warehouse.entrance]];
  const visited = new Set([key(warehouse.entrance)]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i]!;
    const current = path[path.length - 1]!;
    if (key(current) === key(target)) return path;
    for (const [dx, dy] of [[0, -1], [1, 0], [-1, 0], [0, 1]]) {
      const next = { x: current.x + dx!, y: current.y + dy! };
      if (!isWalkable(next) || visited.has(key(next))) continue;
      visited.add(key(next));
      queue.push([...path, next]);
    }
  }
  return [];
}
export function instructionAt(route: Point[], step: number, item: Item): string {
  if (step >= route.length - 1) return `Você chegou à ${item.location.label}. Setor ${item.location.sector}, prateleira ${item.location.shelf}.`;
  const here = route[step];
  const next = route[step + 1];
  if (!here || !next) return 'Selecione um material para calcular o caminho.';
  return next.y < here.y ? 'Siga em frente pelo corredor destacado.' : next.y > here.y ? 'Siga em direção à entrada.' : next.x < here.x ? 'Siga à esquerda pelo corredor.' : 'Siga à direita pelo corredor.';
}
