import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_DIGEST_SCHEDULES_LOAD } from '../../actions/collection/digest-schedules/load';
import { COLLECTION_DIGEST_SCHEDULES_SET } from '../../actions/collection/digest-schedules/set';
import { COLLECTION_DIGEST_SCHEDULES_PUSH } from '../../actions/collection/digest-schedules/push';
import { COLLECTION_DIGEST_SCHEDULES_ERROR } from '../../actions/collection/digest-schedules/error';
import { COLLECTION_DIGEST_SCHEDULES_REMOVE } from '../../actions/collection/digest-schedules/remove';

import { DensityDigestSchedule } from '../../types';

const initialState = {
  view: 'LOADING',
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
      error: null,
      data: action.data.map(d => objectSnakeToCamel<DensityDigestSchedule>(d)),
    };

  // Add a new value to the collection
  case COLLECTION_DIGEST_SCHEDULES_PUSH:
    return {
      ...state,
      view: 'VISIBLE',
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

  case COLLECTION_DIGEST_SCHEDULES_REMOVE:
    return {
      ...state,
      view: 'VISIBLE',
      data: state.data.filter((item: any) => {
        return action.item.id !== item.id;
      }),
    };

  case COLLECTION_DIGEST_SCHEDULES_ERROR:
    return { ...state, view: 'ERROR', error: action.error };

  default:
    return state;
  }
}
