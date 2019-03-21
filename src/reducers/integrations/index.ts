import {
  COLLECTION_INTEGRATIONS_SERVICES_SET,
} from '../../actions/collection/services/set';
import {
  COLLECTION_SERVICES_ERROR,
} from '../../actions/collection/services/error';
import { COLLECTION_SERVICE_AUTHORIZATIONS_CREATE } from '../../actions/collection/service-authorizations/create';
import { COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE } from '../../actions/collection/service-authorizations/update';
import { COLLECTION_SERVICE_AUTHORIZATIONS_DESTROY } from '../../actions/collection/service-authorizations/destroy';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';


const initialState = {
  services: [],
  loading: true,
  error: false,
};

export default function integrations(state=initialState, action) {
  switch (action.type) {
  case COLLECTION_INTEGRATIONS_SERVICES_SET:
    return {
      ...state,
      loading: false,
      services: action.data.map(objectSnakeToCamel),
    };
   case COLLECTION_SERVICES_ERROR:
     return {...state, error: action.error, loading: false};

  // An async action has started.
  case COLLECTION_SERVICE_AUTHORIZATIONS_CREATE:
  case COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE:
  case COLLECTION_SERVICE_AUTHORIZATIONS_DESTROY:
    return {...state, error: null, loading: true};

  default:
    return state;
  }
}
