import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_DIGEST_SCHEDULES_LOAD } from '../../rx-actions/collection/digest-schedules/load';
import { COLLECTION_DIGEST_SCHEDULES_SET } from '../../rx-actions/collection/digest-schedules/set';
import { COLLECTION_DIGEST_SCHEDULES_PUSH } from '../../rx-actions/collection/digest-schedules/push';
import { COLLECTION_DIGEST_SCHEDULES_ERROR } from '../../rx-actions/collection/digest-schedules/error';
import { COLLECTION_DIGEST_SCHEDULES_REMOVE } from '../../rx-actions/collection/digest-schedules/remove';

import { DensityDigestSchedule } from '../../types';
import createRxStore from '..';


export type DigestSchedulesState = {
  view: 'LOADING' | 'VISIBLE' | 'ERROR',
  selected: Any<FixInRefactor>,
  error: unknown,
  data: DensityDigestSchedule[],
}

export const initialState: DigestSchedulesState = {
  view: 'LOADING',
  selected: null,
  error: null,
  data: [],
};

// FIXME: action should be GlobalAction
export function digestSchedulesReducer(state: DigestSchedulesState, action: Any<FixInRefactor>): DigestSchedulesState {
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
        ...state.data.map((item: Any<FixInRefactor>) => {
          const newItem = objectSnakeToCamel(action.item);
          if (action.item.id === item.id) {
            return {...item, ...newItem};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.data.find((i: Any<FixInRefactor>) => i.id === action.item.id) === undefined ?
            [objectSnakeToCamel(action.item)] :
            []
        ),
      ],
    };

  case COLLECTION_DIGEST_SCHEDULES_REMOVE:
    return {
      ...state,
      view: 'VISIBLE',
      data: state.data.filter((item: Any<FixInRefactor>) => {
        return action.item.id !== item.id;
      }),
    };

  case COLLECTION_DIGEST_SCHEDULES_ERROR:
    return { ...state, view: 'ERROR', error: action.error };

  default:
    return state;
  }
}

const DigestSchedulesStore = createRxStore('DigestSchedulesStore', initialState, digestSchedulesReducer);
export default DigestSchedulesStore;
