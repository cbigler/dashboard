import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_ALERTS_LOAD } from '../../actions/collection/alerts/load';
import { COLLECTION_ALERTS_SET } from '../../actions/collection/alerts/set';
import { COLLECTION_ALERTS_PUSH } from '../../actions/collection/alerts/push';
import { COLLECTION_ALERTS_ERROR } from '../../actions/collection/alerts/error';
import { COLLECTION_ALERTS_REMOVE } from '../../actions/collection/alerts/remove';
import { DensityNotification } from '../../types';

const initialState = {
  view: 'LOADING',
  selected: null,
  error: null,
  data: [],
};

export default function alerts(state=initialState, action) {
  switch (action.type) {

  case COLLECTION_ALERTS_LOAD:
    return initialState;

  // Update the whole collectino with a given value
  case COLLECTION_ALERTS_SET:
    return {
      ...state,
      view: 'VISIBLE',
      error: null,
      data: action.data.map(d => objectSnakeToCamel<DensityNotification>(d)),
    };

  // Add a new value to the collection
  case COLLECTION_ALERTS_PUSH:
    return {
      ...state,
      view: 'VISIBLE',
      data: [
        // Update existing items
        ...state.data.map((item: any) => {
          if (action.item.id === item.id) {
            return {...item, ...objectSnakeToCamel<DensityNotification>(action.item)};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.data.find((i: any) => i.id === action.item.id) === undefined ?
            [objectSnakeToCamel<DensityNotification>(action.item)] :
            []
        ),
      ],
    };

  case COLLECTION_ALERTS_REMOVE:
    return {
      ...state,
      view: 'VISIBLE',
      data: state.data.filter((item: any) => {
        return action.item.id !== item.id;
      }),
    };

  case COLLECTION_ALERTS_ERROR:
    return { ...state, view: 'ERROR', error: action.error };

  default:
    return state;
  }
}
