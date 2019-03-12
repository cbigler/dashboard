import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_USERS_LOAD } from '../../actions/collection/users/load';
import { COLLECTION_USERS_CREATE } from '../../actions/collection/users/create';
import { COLLECTION_USERS_DESTROY } from '../../actions/collection/users/destroy';
import { COLLECTION_USERS_UPDATE } from '../../actions/collection/users/update';
import { COLLECTION_USERS_SET } from '../../actions/collection/users/set';
import { COLLECTION_USERS_PUSH } from '../../actions/collection/users/push';
import { COLLECTION_USERS_DELETE } from '../../actions/collection/users/delete';
import { COLLECTION_USERS_ERROR } from '../../actions/collection/users/error';

import { ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL } from '../../actions/route-transition/admin-user-management-detail';


const initialState = {
  view: 'VISIBLE',
  loading: false,
  selected: null,
  error: null,
  filters: { search: '' },
  data: [],
};

export default function users(state=initialState, action) {
  switch (action.type) {

  case ROUTE_TRANSITION_ADMIN_USER_MANAGEMENT_DETAIL:
    if (action.setLoading) {
      return { ...state, selected: action.id, view: 'LOADING', loading: true };
    } else {
      return { ...state, selected: action.id };
    }

  case COLLECTION_USERS_LOAD:
    return initialState;

  case COLLECTION_USERS_SET:
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      error: null,
      data: action.data.map(objectSnakeToCamel),
    };

  // Push an update to a space.
  case COLLECTION_USERS_PUSH:
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

  case COLLECTION_USERS_ERROR:
    return {...state, view: 'ERROR', loading: false, error: action.error};

  // An async operation is starting.
  case COLLECTION_USERS_CREATE:
  case COLLECTION_USERS_DESTROY:
  case COLLECTION_USERS_UPDATE:
    return {...state, error: null, loading: true};

  // Delete a user from the collection.
  case COLLECTION_USERS_DELETE:
    return {
      ...state,
      loading: false,
      data: state.data.filter((item: any) => action.item.id !== item.id),
    };

  case 'COLLECTION_USERS_FILTER':
    return {
      ...state,
      filters: {
        ...state.filters,
        [action.filter]: action.value,
      },
    };

  default:
    return state;
  }
}
