import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_USERS_LOAD } from '../../actions/collection/users/load';
import { COLLECTION_USERS_SET } from '../../actions/collection/users/set';
import { COLLECTION_USERS_ERROR } from '../../actions/collection/users/error';

const initialState = {
  loading: true,
  selected: null,
  error: null,
  data: [],
};

export default function users(state=initialState, action) {
  switch (action.type) {

  case COLLECTION_USERS_LOAD:
    return initialState;

  case COLLECTION_USERS_SET:
    return {
      ...state,
      loading: false,
      error: null,
      data: action.data.map(objectSnakeToCamel),
    };

  case COLLECTION_USERS_ERROR:
    return {...state, loading: false, error: action.error};

  default:
    return state;
  }
}
