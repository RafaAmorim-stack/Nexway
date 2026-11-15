// Fonte única Huawei. y no mapa 2D equivale a Z físico, positivo rumo ao fundo.
export type Point = { x: number; y: number };
export const METERS_PER_CELL = 1;
export const START_TARGET = 'START_HUAWEI' as const;
export const start = { x: 6, y: 0 };
export const shelves = [
  { id: 'A', label: 'A', x: 0, y: 3, width: 12, height: 1, modules: 4, moduleWidth: 3 },
  { id: 'B', label: 'B', x: 0, y: 6, width: 12, height: 1, modules: 4, moduleWidth: 3 },
] as const;
export const destinations = [
  { id: 'SF01001A', shelf: 'A', module: 1, markerTarget: 'SF01001A', markerPosition: { x: 1.5, y: 3 }, accessPoint: { x: 1, y: 2 } },
  { id: 'SF01014A', shelf: 'A', module: 3, markerTarget: 'SF01014A', markerPosition: { x: 7.5, y: 3 }, accessPoint: { x: 7, y: 2 } },
  { id: 'SF01009B', shelf: 'B', module: 1, markerTarget: 'SF01009B', markerPosition: { x: 1.5, y: 6 }, accessPoint: { x: 1, y: 5 } },
  { id: 'SF01012B', shelf: 'B', module: 3, markerTarget: 'SF01012B', markerPosition: { x: 7.5, y: 6 }, accessPoint: { x: 7, y: 5 } },
] as const;
export type DestinationId = typeof destinations[number]['id'];
export type MarkerId = typeof START_TARGET | DestinationId;
export const markers: MarkerId[] = [START_TARGET, ...destinations.map(d => d.markerTarget)];
export const warehouse = {
  metersPerCell: METERS_PER_CELL, entrance: start, racks: shelves, destinations,
  // Margens de circulação; não representam paredes medidas.
  bounds: { minX: -2, maxX: 13, minY: -1, maxY: 8 }, columns: 16, rows: 10,
};
