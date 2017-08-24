import { COLLECTION_TOKENS_SET } from '../../actions/collection/tokens/set';
import { COLLECTION_TOKENS_PUSH } from '../../actions/collection/tokens/push';
import { COLLECTION_TOKENS_FILTER } from '../../actions/collection/tokens/filter';
import { COLLECTION_TOKENS_DELETE } from '../../actions/collection/tokens/delete';
import { COLLECTION_TOKENS_DESTROY } from '../../actions/collection/tokens/destroy';
import { COLLECTION_TOKENS_CREATE } from '../../actions/collection/tokens/create';
import { COLLECTION_TOKENS_UPDATE } from '../../actions/collection/tokens/update';
import { COLLECTION_TOKENS_ERROR } from '../../actions/collection/tokens/error';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import { SHOW_MODAL } from '../../actions/modal/show';
import { HIDE_MODAL } from '../../actions/modal/hide';

const initialState = {
  data: [],
  loading: true,
  error: null,
  filters: {
    search: '',
  },
};

export default function tokens(state=initialState, action) {
  switch (action.type) {
  case COLLECTION_TOKENS_SET:
    return {
      ...state,
      loading: false,
      data: action.data.map(objectSnakeToCamel),
    };

  // Push an update to a token.
  case COLLECTION_TOKENS_PUSH:
    return {
      ...state,
      loading: false,
      data: [
        // Update existing items
        ...state.data.map(item => {
          if (action.item.key === item.key) {
            return {...item, ...objectSnakeToCamel(action.item)};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.data.find(i => i.key === action.item.key) === undefined ?
            [objectSnakeToCamel(action.item)] :
            []
        ),
      ],
    };

  // Token operation has started.
  case COLLECTION_TOKENS_CREATE:
  case COLLECTION_TOKENS_DESTROY:
  case COLLECTION_TOKENS_UPDATE:
    return {...state, loading: true, error: null};

  // Error in performing an operation on the collection.
  case COLLECTION_TOKENS_ERROR:
    return {...state, error: action.error, loading: false};

  // Add a filter to the tokens collection.
  case COLLECTION_TOKENS_FILTER:
    return {
      ...state,
      filters: {
        ...state.filters,
        [action.filter]: action.value,
      },
    };

  // Delete a token from the collection.
  case COLLECTION_TOKENS_DELETE:
    return {
      ...state,
      loading: false,
      data: state.data.filter(item => action.item.key !== item.key),
    };

  // When a modal is closed, clear any errors on in the store in this reducer.
  case SHOW_MODAL:
  case HIDE_MODAL:
    return {...state, error: null};

  default:
    return state;
  }
}
