import { COLLECTION_INTEGRATIONS_SERVICES_SET } from '../../actions/collection/services/set';
import { COLLECTION_SERVICES_ERROR } from '../../actions/collection/services/error';

import { COLLECTION_SERVICE_AUTHORIZATIONS_CREATE } from '../../actions/collection/service-authorizations/create';
import { COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE } from '../../actions/collection/service-authorizations/update';
import { COLLECTION_SERVICE_AUTHORIZATIONS_DESTROY } from '../../actions/collection/service-authorizations/destroy';

import { ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS } from '../../actions/route-transition/explore-space-meetings';

import {
  INTEGRATIONS_ROOM_BOOKING_SET_DEFAULT_SERVICE,
  INTEGRATIONS_ROOM_BOOKING_SELECT_SPACE_MAPPING,
  INTEGRATIONS_ROOM_BOOKING_SPACES_SET,
  INTEGRATIONS_ROOM_BOOKING_SPACES_ERROR,
} from '../../actions/integrations/room-booking';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';


const initialState = {
  services: [],
  loading: true,
  error: false,

  roomBooking: {
    view: 'LOADING',
    defaultService: null,
    spaceMappingForActiveSpace: null,
  },

  robinSpaces: {
    view: ('LOADING' as any),
    data: ([] as Array<any>),
    error: (null as any),
  },

  teemSpaces: {
    view: ('LOADING' as any),
    data: ([] as Array<any>),
    error: (null as any),
  },
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

  case ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS:
    return {
      ...state,
      robinSpaces: {
        ...state.robinSpaces,
        view: 'LOADING',
        data: [],
        error: null,
      },
      teemSpaces: {
        ...state.teemSpaces,
        view: 'LOADING',
        data: [],
        error: null,
      },
      roomBooking: {
        ...state.roomBooking,
        view: 'LOADING',
        defaultService: null,
      },
    };

  case INTEGRATIONS_ROOM_BOOKING_SET_DEFAULT_SERVICE:
    return {
      ...state,
      roomBooking: {
        ...state.roomBooking,
        view: 'VISIBLE',
        defaultService: action.service,
      },
    };

  case INTEGRATIONS_ROOM_BOOKING_SELECT_SPACE_MAPPING:
    return {
      ...state,
      roomBooking: {
        ...state.roomBooking,
        spaceMappingForActiveSpace: action.data,
      },
    };

  case INTEGRATIONS_ROOM_BOOKING_SPACES_SET:
    if (action.service == "robin") {
      return {
        ...state,
        robinSpaces: {
          ...state.robinSpaces,
          view: 'VISIBLE',
          data: action.data,
          error: null,
        }
      }
    } else if (action.service == "teem") {
      return {
        ...state,
        teemSpaces: {
          ...state.teemSpaces,
          view: 'VISIBLE',
          data: action.data,
          error: null,
        }
      }
    } else {
      return {
        ...state
      }
    }
    
  case INTEGRATIONS_ROOM_BOOKING_SPACES_ERROR:
    let newSpacesErrorKey;
    if (action.service == "robin") {
      newSpacesErrorKey = { robinSpaces: {
        ...state.robinSpaces,
        view: 'ERROR',
        error: action.error,
      }};
    } else if (action.service == "teem") {
      newSpacesErrorKey = { teemSpaces: {
        ...state.teemSpaces,
        view: 'ERROR',
        error: action.error,
      }};
    }
    return {
      ...state,
      newSpacesErrorKey
    };


  default:
    return state;
  }
}
