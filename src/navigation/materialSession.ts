import { items, type Item, type Location } from '../data/catalog';
export type RackId = Location['id'];
export type MaterialSession = { item: Item; startRecognized: boolean; recognizedRack: RackId | null; arrivedAt: number | null };
export type MaterialAction = { type: 'select'; code: string } | { type: 'recognize-start' } | { type: 'recognize-rack'; rack: RackId; at: number };
export function initialMaterialSession(): MaterialSession {
  return { item: items[0]!, startRecognized: false, recognizedRack: null, arrivedAt: null };
}
export function materialSessionReducer(state: MaterialSession, action: MaterialAction): MaterialSession {
  if (action.type === 'recognize-start') return state.startRecognized ? state : { ...state, startRecognized: true };
  if (action.type === 'recognize-rack') {
    if (!state.startRecognized || state.arrivedAt !== null || state.recognizedRack === action.rack) return state;
    return { ...state, recognizedRack: action.rack, arrivedAt: action.rack === state.item.location.id ? action.at : null };
  }
  const item = items.find(candidate => candidate.code === action.code);
  if (!item || item.code === state.item.code) return state;
  return { item, startRecognized: false, recognizedRack: null, arrivedAt: null };
}
export function materialStatus(state: MaterialSession) {
  return {
    status: state.arrivedAt !== null ? 'Estante correta reconhecida' : state.recognizedRack ? 'Estante incorreta' : state.startRecognized ? 'START reconhecido · Aguardando marcador da estante destino' : 'Aguardando marcador START',
    material: 'Material: ' + state.item.code + ' · ' + state.item.description,
    destination: 'Destino: ' + state.item.location.id,
  };
}
