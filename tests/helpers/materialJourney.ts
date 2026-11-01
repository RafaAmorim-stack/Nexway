import { materialSessionReducer as reduce, type MaterialSession } from '../../src/navigation/materialSession';
import { materialRoute } from '../../src/navigation/materialRoute';
import { checkpointPosition, type Pose } from '../../src/navigation/relativeNavigation';

export const origin: Pose = { position: [0, 1.6, 0], forward: [0, 0, -1] };
export const poseAt = (x: number, z: number): Pose => ({ position: [x, 1.6, -z], forward: [0, 0, -1] });
export function completeRoute(session: MaterialSession): MaterialSession {
  session = reduce(session, { type: 'calibrate', pose: origin });
  const route = materialRoute(session)!;
  for (const point of route.points.slice(1)) {
    const p = checkpointPosition({ label: '', point });
    session = reduce(session, { type: 'pose', pose: poseAt(p.x, p.z) });
  }
  return session;
}
