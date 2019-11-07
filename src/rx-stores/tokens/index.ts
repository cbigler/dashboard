import { COLLECTION_TOKENS_SET } from '../../rx-actions/collection/tokens/set';
import { COLLECTION_TOKENS_PUSH } from '../../rx-actions/collection/tokens/push';
import { COLLECTION_TOKENS_FILTER } from '../../rx-actions/collection/tokens/filter';
import { COLLECTION_TOKENS_DELETE } from '../../rx-actions/collection/tokens/delete';
import { COLLECTION_TOKENS_DESTROY } from '../../rx-actions/collection/tokens/destroy';
import { COLLECTION_TOKENS_CREATE } from '../../rx-actions/collection/tokens/create';
import { COLLECTION_TOKENS_UPDATE } from '../../rx-actions/collection/tokens/update';
import { COLLECTION_TOKENS_ERROR } from '../../rx-actions/collection/tokens/error';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import { SHOW_MODAL } from '../../rx-actions/modal/show';
import { HIDE_MODAL } from '../../rx-actions/modal/hide';

import { DensityToken } from '../../types';
import createRxStore from '..';


export type TokensState = {
  data: DensityToken[],
  loading: boolean,
  error: unknown,
  filters: {
    [filterType: string]: Any<FixInRefactor>
  }
}

export const initialState: TokensState = {
  data: [],
  loading: true,
  error: null,
  filters: {
    search: '',
  },
};

export function tokensReducer(state: TokensState, action: Any<FixInRefactor>): TokensState {
  switch (action.type) {
  case COLLECTION_TOKENS_SET:
    return {
      ...state,
      loading: false,
      data: action.data.map(t => objectSnakeToCamel<DensityToken>(t)),
    };

  // Push an update to a token.
  case COLLECTION_TOKENS_PUSH:
    return {
      ...state,
      loading: false,
      data: [
        // Update existing items
        ...state.data.map((item: any) => {
          const newItem = objectSnakeToCamel(action.item);
          if (action.item.key === item.key) {
            return {...item, ...newItem};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.data.find((i: any) => i.key === action.item.key) === undefined ?
          [objectSnakeToCamel<DensityToken>(action.item)] :
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
      data: state.data.filter((item: any) => action.item.key !== item.key),
    };

  // When a modal is closed, clear any errors on in the store in this reducer.
  case SHOW_MODAL:
  case HIDE_MODAL:
    return {...state, error: null};

  default:
    return state;
  }
}

const TokensStore = createRxStore('TokensStore', initialState, tokensReducer);
export default TokensStore;
