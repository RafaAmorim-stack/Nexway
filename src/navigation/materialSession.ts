import { items, type Item, type Location } from '../data/catalog';
import { materialRoute } from './materialRoute';
import { initialNavigation, navigationReducer, checkpointsCompleted, type NavigationState, type Pose } from './relativeNavigation';
export type RackId = Location['id'];
export type MaterialSession = { item: Item; startRecognized: boolean; recognizedRack: RackId | null; arrivedAt: number | null; navigation: NavigationState };
export type MaterialNavigationAction = { type: 'calibrate'; pose: Pose } | { type: 'pose'; pose: Pose } | { type: 'navigation-lost' };
export type MaterialAction = { type: 'select'; code: string } | { type: 'recognize-start' } | { type: 'recognize-rack'; rack: RackId; at: number } | MaterialNavigationAction;
export function initialMaterialSession(): MaterialSession {
  return { item: items[0]!, startRecognized: false, recognizedRack: null, arrivedAt: null, navigation: initialNavigation(items[0]!.code) };
}
export function canValidateRack(state: MaterialSession): boolean {
  return state.startRecognized && checkpointsCompleted(state.navigation, materialRoute(state)?.checkpoints ?? []);
}
export function materialSessionReducer(state: MaterialSession, action: MaterialAction): MaterialSession {
  if (action.type === 'calibrate' || action.type === 'pose' || action.type === 'navigation-lost') {
    if (state.arrivedAt !== null) return state;
    const navigation = navigationReducer(state.navigation, action.type === 'pose'
      ? { ...action, checkpoints: materialRoute(state)?.checkpoints ?? [] }
      : action.type === 'navigation-lost' ? { type: 'lost' } : action);
    if (navigation === state.navigation) return state;
    return { ...state, navigation, startRecognized: navigation.origin !== null,
      recognizedRack: navigation.origin === null || action.type === 'calibrate' ? null : state.recognizedRack };
  }
  if (action.type === 'recognize-start') return state.startRecognized ? state : { ...state, startRecognized: true };
  if (action.type === 'recognize-rack') {
    if (!state.startRecognized || state.arrivedAt !== null || state.recognizedRack === action.rack) return state;
    if (action.rack === state.item.location.id && !canValidateRack(state)) return state;
    return { ...state, recognizedRack: action.rack, arrivedAt: action.rack === state.item.location.id ? action.at : null };
  }
  const item = items.find(candidate => candidate.code === action.code);
  if (!item || item.code === state.item.code) return state;
  return { item, startRecognized: false, recognizedRack: null, arrivedAt: null, navigation: initialNavigation(item.code) };
}
export function materialStatus(state: MaterialSession) {
  return {
    status: state.arrivedAt !== null ? 'Estante correta reconhecida' : state.recognizedRack ? 'Estante incorreta' : canValidateRack(state) ? 'Checkpoints concluídos · Aguardando marcador da estante destino' : state.startRecognized ? 'START reconhecido · Percorra os checkpoints em ordem' : 'Aguardando marcador START',
    material: 'Material: ' + state.item.code + ' · ' + state.item.description,
    destination: 'Destino: ' + state.item.location.id,
  };
}
