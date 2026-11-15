import type { Item } from '../data/catalog';
import { warehouse, destinations, type DestinationId, type Point } from '../navigation/warehouseLayout';
export { warehouse, type Point } from '../navigation/warehouseLayout';
export function isWalkable(point: Point): boolean {
  const b = warehouse.bounds;
  return Number.isInteger(point.x) && Number.isInteger(point.y) &&
    point.x >= b.minX && point.x <= b.maxX && point.y >= b.minY && point.y <= b.maxY &&
    !warehouse.racks.some(r => point.x >= r.x && point.x < r.x + r.width && point.y >= r.y && point.y < r.y + r.height);
}
export function routeToDestination(id: DestinationId): Point[] {
  const target = destinations.find(d => d.id === id)?.accessPoint;
  if (!target || !isWalkable(target)) return [];
  const key = (p: Point) => p.x + ',' + p.y;
  const queue: Point[][] = [[warehouse.entrance]];
  const visited = new Set([key(warehouse.entrance)]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i]!;
    const current = path[path.length - 1]!;
    if (key(current) === key(target)) return path;
    for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
      const next = { x: current.x + dx!, y: current.y + dy! };
      if (!isWalkable(next) || visited.has(key(next))) continue;
      visited.add(key(next));
      queue.push([...path, next]);
    }
  }
  return [];
}
export function instructionAt(route: Point[], step: number, item: Item): string {
  if (step >= route.length - 1) return 'Acesso a ' + item.code + '. ' + item.location.label + ', módulo ' + item.location.module + '. Valide a etiqueta na câmera AR.';
  const here = route[step];
  const next = route[step + 1];
  if (!here || !next) return 'Selecione um endereço para calcular o caminho.';
  return next.y > here.y ? 'Siga em frente pelo corredor destacado.' : next.y < here.y ? 'Siga em direção à entrada.' : next.x < here.x ? 'Siga à esquerda pelo corredor.' : 'Siga à direita pelo corredor.';
}
