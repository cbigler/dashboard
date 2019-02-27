import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_DISPATCH_SCHEDULES_LOAD } from '../../actions/collection/dispatch-schedules/load';
import { COLLECTION_DISPATCH_SCHEDULES_SET } from '../../actions/collection/dispatch-schedules/set';
import { COLLECTION_DISPATCH_SCHEDULES_ERROR } from '../../actions/collection/dispatch-schedules/error';

const initialState = {
  view: 'LOADING',
  loading: true,
  selected: null,
  error: null,
  data: [],
};

export default function dispatchSchedules(state=initialState, action) {
  switch (action.type) {

  case COLLECTION_DISPATCH_SCHEDULES_LOAD:
    return initialState;

  case COLLECTION_DISPATCH_SCHEDULES_SET:
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      error: null,
      data: action.data.map(objectSnakeToCamel),
    };

  case COLLECTION_DISPATCH_SCHEDULES_ERROR:
    return {...state, view: 'ERROR', loading: false, error: action.error};

  default:
    return state;
  }
}
