import {
  DensityService,
  DensityServiceSpace,
  DensityDoorwayMapping,
  DensitySpaceMapping,
} from '../types';
import { Resource } from '../types/resource';
import { CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces'; 
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways'; 

// Since doorway mappings aren't as abstract as space mappings are,
// create an "abstract form" of a doorway mapping that the interface knows how to consume.
export type AbstractServiceDoorway = {
  id: any,
  name: string,
}

type MappingStatus = 'CLEAN' | 'DIRTY' | 'LOADING';

export type DensitySpaceMappingWithStatus = DensitySpaceMapping & { status: MappingStatus };
export type DensityDoorwayMappingWithStatus = DensityDoorwayMapping & { status: MappingStatus };

type SelectedServiceEmpty = { status: 'CLOSED', item: null };
export type SelectedService = {
  status: 'OPEN',
  item: DensityService,

  spaceMappings: Resource<{
    spaceMappings: Array<DensitySpaceMappingWithStatus>,
    serviceSpaces: Array<DensityServiceSpace>,
    hierarchy: Array<CoreSpaceHierarchyNode>,

    newSpaceId: string | null,
    newServiceSpaceId: string | null,
  }>,
  doorwayMappings: Resource<{
    doorwayMappings: Array<DensityDoorwayMappingWithStatus>,
    serviceDoorways: Array<AbstractServiceDoorway>,
    doorways: Array<CoreDoorway>,

    newDoorwayId: string | null,
    newServiceDoorwayId: string | null,
  }>,
};

type ViewState = 'LOADING' | 'VISIBLE' | 'COMPLETE' | 'ERROR';
export type IntegrationsState = {
  services: Resource<Array<DensityService>>,

  selectedService: (
    | SelectedServiceEmpty
    | SelectedService
  ),

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

export type ServiceStatus = 'active' | 'error' | 'inactive';

// Defines how a service should be rendered in its modal when it is opened.
export type ServiceRenderingPreferences = {
  activationProcess: (
    // "Login": The user needs to log into the service in the browser to activate the integration.
    | { type: 'login', onClick: (service: DensityService) => void }
    // "Support": The user needs to contact support to set up the integration
    | { type: 'support' }
    // "Form": The user needs to fill out a custom form to activate the integration
    | { type: 'form', component: React.FunctionComponent<{service: DensityService}> }
  ),
  spaceMappings: (
    | { enabled: false }
    | {
      enabled: true,
      // What are they called in the third party system? Spaces? Calendars? Regions?
      serviceSpaceResourceName: string,
    }
  ),
  doorwayMappings: (
    | { enabled: false }
    | {
      enabled: true,
      fetchServiceDoorways: (service: DensityService) => Promise<Array<AbstractServiceDoorway>>,
      // What are they called in the third party system? Doorways? Portals? Access points? Cased openings?
      serviceDoorwayResourceName: string,
    }
  )
}
