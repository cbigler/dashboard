import {
  DensityService,
  DensityServiceSpace,
  DensityDoorwayMapping,
} from '../types';
import { Resource } from '../types/resource';

type SelectedServiceEmpty = { item: null };
export type SelectedService = {
  item: DensityService,

  spaceMappings: Resource<Array<DensityServiceSpace>>,
  doorwayMappings: Resource<Array<DensityDoorwayMapping>>,
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
  hasSpaceMappings: boolean,
  hasDoorwayMappings: boolean,
}
