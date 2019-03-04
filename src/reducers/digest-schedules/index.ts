import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_DIGEST_SCHEDULES_LOAD } from '../../actions/collection/digest-schedules/load';
import { COLLECTION_DIGEST_SCHEDULES_SET } from '../../actions/collection/digest-schedules/set';
import { COLLECTION_DIGEST_SCHEDULES_PUSH } from '../../actions/collection/digest-schedules/push';
import { COLLECTION_DIGEST_SCHEDULES_ERROR } from '../../actions/collection/digest-schedules/error';

const initialState = {
  view: 'LOADING',
  loading: true,
  selected: null,
  error: null,
  data: [],
};

export default function digestSchedules(state=initialState, action) {
  switch (action.type) {

  case COLLECTION_DIGEST_SCHEDULES_LOAD:
    return initialState;

  // Update the whole collectino with a given value
  case COLLECTION_DIGEST_SCHEDULES_SET:
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      error: null,
      data: action.data.map(objectSnakeToCamel),
    };

  // Add a new value to the collection
  case COLLECTION_DIGEST_SCHEDULES_PUSH:
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      data: [
        // Update existing items
        ...state.data.map((item: any) => {
          if (action.item.id === item.id) {
            return {...item, ...objectSnakeToCamel(action.item)};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.data.find((i: any) => i.id === action.item.id) === undefined ?
            [objectSnakeToCamel(action.item)] :
            []
        ),
      ],
    };

  case COLLECTION_DIGEST_SCHEDULES_ERROR:
    return {...state, view: 'ERROR', loading: false, error: action.error};

  default:
    return state;
  }
}
