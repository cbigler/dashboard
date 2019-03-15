import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_WEBHOOKS_SET } from '../../actions/collection/webhooks/set';
import { COLLECTION_WEBHOOKS_PUSH } from '../../actions/collection/webhooks/push';
import { COLLECTION_WEBHOOKS_DELETE } from '../../actions/collection/webhooks/delete';
import { COLLECTION_WEBHOOKS_FILTER } from '../../actions/collection/webhooks/filter';
import { COLLECTION_WEBHOOKS_CREATE } from '../../actions/collection/webhooks/create';
import { COLLECTION_WEBHOOKS_DESTROY } from '../../actions/collection/webhooks/destroy';
import { COLLECTION_WEBHOOKS_UPDATE } from '../../actions/collection/webhooks/update';
import { COLLECTION_WEBHOOKS_ERROR } from '../../actions/collection/webhooks/error';

const initialState = {
  data: [],
  loading: true,
  error: null,
  filters: {
    search: '',
  },
};
export default function webhooks(state=initialState, action) {
  switch (action.type) {

  // Update the whole space collection.
  case COLLECTION_WEBHOOKS_SET:
    return {
      ...state,
      loading: false,
      data: action.data.map(objectSnakeToCamel),
    }

  // Push an update to a space.
  case COLLECTION_WEBHOOKS_PUSH:
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
            [objectSnakeToCamel(action.item)] :
            []
        ),
      ],
    };

  // Webhook operation has started.
  case COLLECTION_WEBHOOKS_CREATE:
  case COLLECTION_WEBHOOKS_DESTROY:
  case COLLECTION_WEBHOOKS_UPDATE:
    return {...state, loading: true, error: null};

  // Error in performing an operation on the collection.
  case COLLECTION_WEBHOOKS_ERROR:
    return {...state, error: action.error, loading: false};

  // Delete a space from the collection.
  case COLLECTION_WEBHOOKS_DELETE:
    return {
      ...state,
      loading: false,
      data: state.data.filter((item: any) => action.item.id !== item.id),
    };

  // Add a filter to a webhook.
  case COLLECTION_WEBHOOKS_FILTER:
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
