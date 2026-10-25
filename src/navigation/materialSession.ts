import { items, type Item } from '../data/catalog';
export type MaterialSession = { item: Item; startRecognized: boolean };
export type MaterialAction = { type: 'select'; code: string } | { type: 'recognize-start' };
export function initialMaterialSession(): MaterialSession {
  return { item: items[0]!, startRecognized: false };
}
export function materialSessionReducer(state: MaterialSession, action: MaterialAction): MaterialSession {
  if (action.type === 'recognize-start') return state.startRecognized ? state : { ...state, startRecognized: true };
  const item = items.find(candidate => candidate.code === action.code);
  if (!item || item.code === state.item.code) return state;
  return { item, startRecognized: false };
}
export function materialStatus(state: MaterialSession) {
  return {
    status: state.startRecognized ? 'START reconhecido' : 'Aguardando marcador START',
    material: `Material: ${state.item.code} · ${state.item.description}`,
    destination: `Destino: ${state.item.location.id}`,
  };
}
