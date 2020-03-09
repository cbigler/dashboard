import { COLLECTION_SERVICE_AUTHORIZATIONS_CREATE } from '../../rx-actions/collection/service-authorizations/create';
import { COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE } from '../../rx-actions/collection/service-authorizations/update';
import { COLLECTION_SERVICE_AUTHORIZATIONS_DESTROY } from '../../rx-actions/collection/service-authorizations/destroy';

import { COLLECTION_SERVICE_SPACES_SET } from '../../rx-actions/collection/service-spaces/set';
import { COLLECTION_SERVICE_SPACES_ERROR } from '../../rx-actions/collection/service-spaces/error';

import { ROUTE_TRANSITION_ADMIN_SPACE_MAPPINGS } from '../../rx-actions/route-transition/admin-space-mappings';

import {
  INTEGRATIONS_ROOM_BOOKING_SET_SERVICE,
} from '../../rx-actions/integrations/room-booking';

import { RESOURCE_IDLE, RESOURCE_LOADING, ResourceStatus } from '../../types/resource';

import createRxStore from '..';

import { 
  IntegrationsState,
} from '../../types/integrations';


type ViewState = 'LOADING' | 'VISIBLE' | 'COMPLETE' | 'ERROR';
const initialState: IntegrationsState = {
  services: RESOURCE_IDLE,

  selectedService: {
    status: 'CLOSED',
    item: null,
  },

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
  case 'INTEGRATIONS_LOAD_START':
    return {
      ...state,
      services: RESOURCE_LOADING,
    };

  case 'INTEGRATIONS_LOAD_COMPLETE':
    return {
      ...state,
      services: {
        status: ResourceStatus.COMPLETE,
        data: action.data,
      },
    };

  case 'INTEGRATIONS_LOAD_ERROR':
    return {
      ...state,
      services: {
        status: ResourceStatus.ERROR,
        error: action.error,
      },
    };

  case 'INTEGRATIONS_SERVICE_OPEN':
    return {
      ...state,
      selectedService: {
        status: 'OPEN',
        item: action.service,
        spaceMappings: RESOURCE_IDLE,
        doorwayMappings: RESOURCE_IDLE,
      },
    }

  case 'INTEGRATIONS_SERVICE_CLOSE':
    return {
      ...state,
      selectedService: {
        status: 'CLOSED',
        item: null,
      },
    }
  }

  if (state.selectedService.status !== 'OPEN') { return state; }

  switch (action.type) {

  //
  // SPACE MAPPINGS
  //
  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_START':
    return {
      ...state,
      selectedService: {
        ...state.selectedService,
        spaceMappings: RESOURCE_LOADING,
      },
    }

  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_COMPLETE':
    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        spaceMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            spaceMappings: action.spaceMappings,
            serviceSpaces: action.serviceSpaces,
            hierarchy: action.hierarchy,

            newServiceSpaceId: null,
            newSpaceId: null,
          },
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_ERROR':
    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        spaceMappings: {
          status: ResourceStatus.ERROR,
          error: action.error,
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_CHANGE_NEW_DENSITY_SPACE_ID':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.spaceMappings.status !== ResourceStatus.COMPLETE) { return state; }
    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        spaceMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.spaceMappings.data,
            newSpaceId: action.value,
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_CHANGE_NEW_SERVICE_SPACE_ID':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.spaceMappings.status !== ResourceStatus.COMPLETE) { return state; }
    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        spaceMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.spaceMappings.data,
            newServiceSpaceId: action.value,
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_ADD':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.spaceMappings.status !== ResourceStatus.COMPLETE) { return state; }

    // Ensure both density space id and service space id were set
    const data = state.selectedService.spaceMappings.data;
    if (data.newSpaceId === null || data.newServiceSpaceId === null) {
      return state;
    }

    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        spaceMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.spaceMappings.data,
            newSpaceId: null,
            newServiceSpaceId: null,
            spaceMappings: [
              ...data.spaceMappings,
              {
                id: '',
                service_id: state.selectedService.item.id,
                space_id: data.newSpaceId,
                service_space_id: data.newServiceSpaceId,
              },
            ],
          }
        },
      },
    }

  //
  // DOORWAY MAPPINGS
  //
  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_START':
    return {
      ...state,
      selectedService: {
        ...state.selectedService,
        doorwayMappings: RESOURCE_LOADING,
      },
    }

  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_COMPLETE':
    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            doorwayMappings: action.doorwayMappings,
            serviceDoorways: action.serviceDoorways,
          },
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_ERROR':
    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.ERROR,
          error: action.error,
        },
      },
    }
  }

  switch (action.type) {
  // An async action has started.
  case COLLECTION_SERVICE_AUTHORIZATIONS_CREATE:
  case COLLECTION_SERVICE_AUTHORIZATIONS_UPDATE:
  case COLLECTION_SERVICE_AUTHORIZATIONS_DESTROY:
    return state;
  
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
