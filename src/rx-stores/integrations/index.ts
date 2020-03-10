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
    id: null,
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
        id: action.service.id,
        spaceMappings: RESOURCE_IDLE,
        doorwayMappings: RESOURCE_IDLE,
      },
    }

  case 'INTEGRATIONS_SERVICE_CLOSE':
    return {
      ...state,
      selectedService: {
        status: 'CLOSED',
        id: null,
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
    if (state.selectedService.status !== 'OPEN') { return state; }
    const selectedServiceId = state.selectedService.id;

    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        spaceMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            spaceMappings: action.spaceMappings
              .filter(i => i.service_id === selectedServiceId)
              .map(i => ({...i, status: 'CLEAN' as const})),
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


  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_BEGIN_LOADING':
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
            spaceMappings: state.selectedService.spaceMappings.data.spaceMappings.map(sm => {
              if (sm.id === action.id) {
                return { ...sm, status: 'LOADING' as const };
              } else {
                return sm;
              }
            }),
          }
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
    const spaceData = state.selectedService.spaceMappings.data;
    if (spaceData.newSpaceId === null || spaceData.newServiceSpaceId === null) {
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
              ...spaceData.spaceMappings,
              {
                id: action.id,
                service_id: state.selectedService.id,
                space_id: action.spaceId,
                service_space_id: action.serviceSpaceId,
                status: 'CLEAN',
              },
            ],
          }
        },
      },
    }


  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_UPDATE_CHANGE_DENSITY_SPACE_ID':
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
            spaceMappings: state.selectedService.spaceMappings.data.spaceMappings.map(sm => {
              if (sm.id === action.id) {
                return { ...sm, status: 'DIRTY' as const, space_id: action.spaceId }
              } else {
                return sm;
              }
            }),
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_UPDATE_CHANGE_SERVICE_SPACE_ID':
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
            spaceMappings: state.selectedService.spaceMappings.data.spaceMappings.map(sm => {
              if (sm.id === action.id) {
                return { ...sm, status: 'DIRTY' as const, service_space_id: action.serviceSpaceId }
              } else {
                return sm;
              }
            }),
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_UPDATE_COMPLETE':
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
            spaceMappings: state.selectedService.spaceMappings.data.spaceMappings.map(sm => {
              if (sm.id === action.id) {
                return { ...sm, status: 'CLEAN' as const };
              } else {
                return sm;
              }
            }),
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_DELETE_COMPLETE':
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
            spaceMappings: state.selectedService.spaceMappings.data.spaceMappings.filter(sm => sm.id !== action.id),
          },
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
            doorways: action.doorways,
            newDoorwayId: null,
            newServiceDoorwayId: null,
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

  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_BEGIN_LOADING':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.doorwayMappings.status !== ResourceStatus.COMPLETE) { return state; }

    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.doorwayMappings.data,
            doorwayMappings: state.selectedService.doorwayMappings.data.doorwayMappings.map(sm => {
              if (sm.id === action.id) {
                return { ...sm, status: 'LOADING' as const };
              } else {
                return sm;
              }
            }),
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_CHANGE_NEW_DENSITY_DOORWAY_ID':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.doorwayMappings.status !== ResourceStatus.COMPLETE) { return state; }
    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.doorwayMappings.data,
            newDoorwayId: action.value,
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_CHANGE_NEW_SERVICE_DOORWAY_ID':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.doorwayMappings.status !== ResourceStatus.COMPLETE) { return state; }
    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.doorwayMappings.data,
            newServiceDoorwayId: action.value,
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_ADD':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.doorwayMappings.status !== ResourceStatus.COMPLETE) { return state; }

    // Ensure both density doorway id and service doorway id were set
    const doorwayData = state.selectedService.doorwayMappings.data;
    if (doorwayData.newDoorwayId === null || doorwayData.newServiceDoorwayId === null) {
      return state;
    }

    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.doorwayMappings.data,
            newDoorwayId: null,
            newServiceDoorwayId: null,
            doorwayMappings: [
              ...doorwayData.doorwayMappings,
              {
                id: action.id,
                service_id: state.selectedService.id,
                doorway_id: action.doorwayId,
                service_doorway_id: action.serviceDoorwayId,
                status: 'CLEAN',
              },
            ],
          }
        },
      },
    }


  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_UPDATE_CHANGE_DENSITY_DOORWAY_ID':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.doorwayMappings.status !== ResourceStatus.COMPLETE) { return state; }

    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.doorwayMappings.data,
            doorwayMappings: state.selectedService.doorwayMappings.data.doorwayMappings.map(sm => {
              if (sm.id === action.id) {
                return { ...sm, status: 'DIRTY' as const, doorway_id: action.doorwayId }
              } else {
                return sm;
              }
            }),
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_UPDATE_CHANGE_SERVICE_DOORWAY_ID':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.doorwayMappings.status !== ResourceStatus.COMPLETE) { return state; }

    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.doorwayMappings.data,
            doorwayMappings: state.selectedService.doorwayMappings.data.doorwayMappings.map(sm => {
              if (sm.id === action.id) {
                return { ...sm, status: 'DIRTY' as const, service_doorway_id: action.serviceDoorwayId }
              } else {
                return sm;
              }
            }),
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_UPDATE_COMPLETE':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.doorwayMappings.status !== ResourceStatus.COMPLETE) { return state; }

    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.doorwayMappings.data,
            doorwayMappings: state.selectedService.doorwayMappings.data.doorwayMappings.map(sm => {
              if (sm.id === action.id) {
                return { ...sm, status: 'CLEAN' as const };
              } else {
                return sm;
              }
            }),
          }
        },
      },
    }

  case 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_DELETE_COMPLETE':
    if (state.selectedService.status !== 'OPEN') { return state; }
    if (state.selectedService.doorwayMappings.status !== ResourceStatus.COMPLETE) { return state; }

    return {
      ...state,
      selectedService: {
        ...state.selectedService,

        doorwayMappings: {
          status: ResourceStatus.COMPLETE,
          data: {
            ...state.selectedService.doorwayMappings.data,
            doorwayMappings: state.selectedService.doorwayMappings.data.doorwayMappings.filter(sm => sm.id !== action.id),
          },
        },
      },
    }

  default:
    return state;
  }
}

const IntegrationsStore = createRxStore('IntegrationsStore', initialState, integrationsReducer);
export default IntegrationsStore;
