import { DensityServiceSpace, DensityService } from '../../types';

import { COLLECTION_SERVICES_SET } from '../../rx-actions/collection/services/set';
import { COLLECTION_SERVICES_ERROR } from '../../rx-actions/collection/services/error';

import { COLLECTION_SERVICE_AUTHORIZATIONS_CREATE } from '../../rx-actions/collection/service-authorizations/create';
import { COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE } from '../../rx-actions/collection/service-authorizations/update';
import { COLLECTION_SERVICE_AUTHORIZATIONS_DESTROY } from '../../rx-actions/collection/service-authorizations/destroy';

import { COLLECTION_SERVICE_SPACES_SET } from '../../rx-actions/collection/service-spaces/set';
import { COLLECTION_SERVICE_SPACES_ERROR } from '../../rx-actions/collection/service-spaces/error';

import { ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS } from '../../rx-actions/route-transition/explore-space-meetings';
import { ROUTE_TRANSITION_ADMIN_SPACE_MAPPINGS } from '../../rx-actions/route-transition/admin-space-mappings';

import {
  INTEGRATIONS_ROOM_BOOKING_SET_SERVICE,
} from '../../rx-actions/integrations/room-booking';

import createRxStore from '..';


type ViewState = 'LOADING' | 'VISIBLE' | 'COMPLETE' | 'ERROR';

export type IntegrationsState = {
  services: DensityService[],
  loading: boolean,
  error: unknown,

  roomBooking: {
    view: ViewState,
    service: DensityService | null,
  },

  spaceMappingsPage: {
    view: ViewState,
    error: unknown,
    loading: boolean,
    service: DensityService | null,
    serviceSpaces: DensityServiceSpace[],
  }
}

const initialState: IntegrationsState = {
  services: [],
  loading: true,
  error: false,

  roomBooking: {
    view: 'LOADING',
    service: null,
  },

  spaceMappingsPage: {
    view: 'LOADING',
    error: false,
    loading: true,
    service: null,
    serviceSpaces: [],
  },

};

export function integrationsReducer(state: IntegrationsState, action: Any<FixInRefactor>): IntegrationsState {
  switch (action.type) {
  case COLLECTION_SERVICES_SET:
    return {
      ...state,
      loading: false,
      services: action.data,
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
      roomBooking: {
        ...state.roomBooking,
        view: 'LOADING',
        service: null,
      },
    };
  
  case ROUTE_TRANSITION_ADMIN_SPACE_MAPPINGS:
    return {
      ...state,
      spaceMappingsPage: {
        view: 'LOADING',
        error: false,
        loading: true,
        service: null,
        serviceSpaces: [],
      },
    };

  case INTEGRATIONS_ROOM_BOOKING_SET_SERVICE:
    return {
      ...state,
      roomBooking: {
        ...state.roomBooking,
        view: 'VISIBLE',
        service: action.service,
      },
    };

  case COLLECTION_SERVICE_SPACES_SET:
    return {
      ...state,
      spaceMappingsPage: {
        ...state.spaceMappingsPage,
        view: 'COMPLETE',
        service: action.service,
        serviceSpaces: action.data,
      }
    }; 

  case COLLECTION_SERVICE_SPACES_ERROR:
     return {
       ...state, 
       spaceMappingsPage: {
         ...state.spaceMappingsPage,
         view: 'ERROR',
       } 
     };

  default:
    return state;
  }
}

const IntegrationsStore = createRxStore('IntegrationsStore', initialState, integrationsReducer);
export default IntegrationsStore;
