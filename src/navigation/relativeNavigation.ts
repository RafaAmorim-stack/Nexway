import type { Checkpoint } from './materialRoute';
import { warehouse } from '../warehouse/layout';
export const METERS_PER_CELL = 1;
export const CHECKPOINT_TOLERANCE = 0.45;
export type Pose = { position: readonly number[]; forward: readonly number[] };
export type RelativePoint = { x: number; z: number };
export type NavigationState = { materialCode: string; origin: Pose | null; position: RelativePoint | null; heading: number; nextIndex: number };
export type NavigationAction = { type: 'select'; code: string } | { type: 'calibrate'; pose: Pose } | { type: 'pose'; pose: Pose; checkpoints: readonly Checkpoint[] } | { type: 'lost' };
export function initialNavigation(materialCode: string): NavigationState {
  return { materialCode, origin: null, position: null, heading: 0, nextIndex: 1 };
}
export function validPose(pose: Pose): boolean {
  return pose.position.length === 3 && pose.forward.length === 3 && [...pose.position, ...pose.forward].every(Number.isFinite) && Math.hypot(pose.forward[0]!, pose.forward[2]!) > 0.1;
}
function axes(origin: Pose) {
  const length = Math.hypot(origin.forward[0]!, origin.forward[2]!);
  const fx = origin.forward[0]! / length;
  const fz = origin.forward[2]! / length;
  return { fx, fz, rx: -fz, rz: fx };
}
export function relativePosition(origin: Pose, pose: Pose): RelativePoint {
  const { fx, fz, rx, rz } = axes(origin);
  const dx = pose.position[0]! - origin.position[0]!;
  const dz = pose.position[2]! - origin.position[2]!;
  return { x: dx * rx + dz * rz, z: dx * fx + dz * fz };
}
export function relativeHeading(origin: Pose, pose: Pose): number {
  const { fx, fz, rx, rz } = axes(origin);
  return Math.atan2(pose.forward[0]! * rx + pose.forward[2]! * rz, pose.forward[0]! * fx + pose.forward[2]! * fz);
}
export function checkpointPosition(checkpoint: Checkpoint): RelativePoint {
  return { x: (checkpoint.point.x - warehouse.entrance.x) * METERS_PER_CELL, z: (warehouse.entrance.y - checkpoint.point.y) * METERS_PER_CELL };
}
export function distanceBetween(a: RelativePoint, b: RelativePoint): number {
  return Math.hypot(b.x - a.x, b.z - a.z);
}
export function guidance(state: NavigationState, checkpoints: readonly Checkpoint[]) {
  const checkpoint = checkpoints[state.nextIndex];
  if (!state.origin || !state.position || !checkpoint) return null;
  const target = checkpointPosition(checkpoint);
  const bearing = Math.atan2(target.x - state.position.x, target.z - state.position.z) - state.heading;
  const angle = Math.atan2(Math.sin(bearing), Math.cos(bearing)) * 180 / Math.PI;
  const direction = Math.abs(angle) <= 20 ? 'Siga em frente' : Math.abs(angle) >= 160 ? 'Vire para trás' : angle > 0 ? 'Vire à direita' : 'Vire à esquerda';
  const arrow = Math.abs(angle) <= 20 ? '↑' : Math.abs(angle) >= 160 ? '↓' : angle > 0 ? '→' : '←';
  return { checkpoint, distance: distanceBetween(state.position, target), angle, direction, arrow };
}
export function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  if (action.type === 'select') return action.code === state.materialCode ? state : initialNavigation(action.code);
  if (action.type === 'lost') return initialNavigation(state.materialCode);
  if (!validPose(action.pose)) return initialNavigation(state.materialCode);
  if (action.type === 'calibrate') {
    if (state.origin) return state;
    return { ...state, origin: { position: [...action.pose.position], forward: [...action.pose.forward] }, position: { x: 0, z: 0 }, heading: 0, nextIndex: 1 };
  }
  if (!state.origin) return state;
  const position = relativePosition(state.origin, action.pose);
  // Saltos incompatíveis com a amostragem indicam possível mudança do referencial AR.
  if (state.position && distanceBetween(state.position, position) > 2) return initialNavigation(state.materialCode);
  const next = action.checkpoints[state.nextIndex];
  const reached = next && distanceBetween(position, checkpointPosition(next)) <= CHECKPOINT_TOLERANCE;
  return { ...state, position, heading: relativeHeading(state.origin, action.pose), nextIndex: state.nextIndex + (reached ? 1 : 0) };
}
