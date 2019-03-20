import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_LINKS_SET } from '../../actions/collection/links/set';
import { COLLECTION_LINKS_PUSH } from '../../actions/collection/links/push';
import { COLLECTION_LINKS_DELETE } from '../../actions/collection/links/delete';
import { COLLECTION_LINKS_ERROR } from '../../actions/collection/links/error';
import { COLLECTION_LINKS_UPDATE_SENSOR_PLACEMENT } from '../../actions/collection/links/update-sensor-placement';

import { SHOW_MODAL } from '../../actions/modal/show';
import { HIDE_MODAL } from '../../actions/modal/hide';

import { DensityLink } from '../../types';

const initialState = {
  filters: {
    spaceId: null,
    doorwayId: null,
  },
  loading: false,
  error: null,
  data: [],
};

export default function links(state=initialState, action) {
  switch (action.type) {

  // Update the whole link collection.
  case COLLECTION_LINKS_SET:
    return {
      ...state,
      loading: false,
      data: action.data.map(l => objectSnakeToCamel<DensityLink>(l)),
    };

  // Push an update to a link.
  case COLLECTION_LINKS_PUSH:
    return {
      ...state,
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
          [objectSnakeToCamel<DensityLink>(action.item)] :
            []
        ),
      ],
    };

  // Delete a link from the collection.
  case COLLECTION_LINKS_DELETE:
    return {
      ...state,
      data: state.data.filter((item: any) => action.item.id !== item.id),
    };

  // Start an async operation.
  case COLLECTION_LINKS_UPDATE_SENSOR_PLACEMENT:
    return {...state, loading: true}

  // An async operation raised an error.
  case COLLECTION_LINKS_ERROR:
    return {...state, loading: false, error: action.error};

  // When a modal is closed, clear any errors on in the store in this reducer.
  case SHOW_MODAL:
  case HIDE_MODAL:
    return {...state, error: null};

  default:
    return state;
  }
}
