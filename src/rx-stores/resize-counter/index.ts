import { INCREMENT_RESIZE_COUNTER } from '../../rx-actions/miscellaneous/increment-resize-counter';
import createRxStore from '..';

const initialState = 0;

// FIXME: action should be GlobalAction
export function resizeCounterReducer(state: number, action: Any<FixInRefactor>): number {
  switch (action.type) {
  case INCREMENT_RESIZE_COUNTER:
    return state + 1;
  default:
    return state;
  }
}

const ResizeCounterStore = createRxStore('ResizeCounterStore', initialState, resizeCounterReducer);
export default ResizeCounterStore;
