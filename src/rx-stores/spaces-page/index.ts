import createRxStore, { actions, rxDispatch } from '..';
import { getInitialState, spacesPageReducer } from './reducer';
import { registerSideEffects } from './effects';
import SpacesStore from '../spaces';

const SpacesPageStore = createRxStore('SpacesPageStore', getInitialState(), spacesPageReducer);
registerSideEffects(actions, SpacesPageStore, SpacesStore, rxDispatch);

export default SpacesPageStore;
