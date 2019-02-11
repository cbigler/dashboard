import { INCREMENT_RESIZE_COUNTER } from '../../actions/miscellaneous/increment-resize-counter';

const initialState = 0;

export default function resizeCounter(state=initialState, action) {
  switch (action.type) {
  case INCREMENT_RESIZE_COUNTER:
    return state + 1;
  default:
    return state;
  }
}
