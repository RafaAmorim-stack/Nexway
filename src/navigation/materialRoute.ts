import type { MaterialSession } from './materialSession';
import { routeToDestination, type Point } from '../warehouse/layout';
export type Checkpoint = { label: string; point: Point };
export type MaterialRoute = { points: Point[]; checkpoints: Checkpoint[]; nextInstruction: string };
// Coordenadas locais em células: x cresce para a direita; y equivale a Z e cresce para o fundo.
// As mudanças de direção são checkpoints lógicos, sem markers intermediários.
export function materialRoute(session: MaterialSession): MaterialRoute | null {
  if (!session.startRecognized) return null;
  const points = routeToDestination(session.item.location.id);
  if (points.length < 2) return { points, checkpoints: [], nextInstruction: 'Não foi possível calcular uma rota até o endereço.' };
  const turns = points.filter((point, i) => {
    if (i === 0 || i === points.length - 1) return true;
    const before = points[i - 1]!;
    const after = points[i + 1]!;
    return point.x - before.x !== after.x - point.x || point.y - before.y !== after.y - point.y;
  });
  const checkpoints = turns.map((point, i) => ({ point, label: i === 0 ? 'START' : i === turns.length - 1 ? session.item.location.id : 'Checkpoint ' + i }));
  const first = checkpoints[0]!.point;
  const next = checkpoints[1]!;
  const distance = Math.abs(next.point.x - first.x) + Math.abs(next.point.y - first.y);
  const direction = next.point.y > first.y ? 'em frente' : next.point.y < first.y ? 'em direção à entrada' : next.point.x < first.x ? 'à esquerda' : 'à direita';
  return { points, checkpoints, nextInstruction: session.arrivedAt !== null ? 'Chegada validada pelo marcador ' + session.item.location.id + '.' : 'Siga ' + direction + ' até ' + next.label + ' (' + distance + ' m). Ao alcançar o destino, reconheça ' + session.item.location.id + '.' };
}
