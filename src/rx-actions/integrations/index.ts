import {
  DensityService,
  DensityServiceSpace,
  DensityDoorwayMapping,
} from '../../types';
import { ActionTypesOf } from '..';
import { DispatchType } from '../../types/rx-actions';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';

import fetchAllObjects from '../../helpers/fetch-all-objects';

import {
  ServiceStatus,
  ServiceRenderingPreferences,
} from '../../types/integrations';

export const INTEGRATIONS_MODAL_NAME = 'integration-details';

export async function openService(
  dispatch: DispatchType,
  service: DensityService,
  serviceRenderingPreferences: ServiceRenderingPreferences,
) {
  dispatch(integrationsActions.openService(service));
  showModal(dispatch, INTEGRATIONS_MODAL_NAME);

  if (serviceRenderingPreferences.hasSpaceMappings) {
    dispatch(integrationsActions.spaceMappingStart());

    let serviceSpaces: Array<DensityServiceSpace> = [], errorThrown;
    try {
      serviceSpaces = await fetchAllObjects<DensityServiceSpace>(`/integrations/${service.name}/spaces/`, { cache: false });
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      dispatch(integrationsActions.spaceMappingError(errorThrown));
    } else {
      dispatch(integrationsActions.spaceMappingComplete(serviceSpaces));
    }
  }

  if (serviceRenderingPreferences.hasDoorwayMappings) {
    dispatch(integrationsActions.doorwayMappingStart());

    let doorwayMappings: Array<DensityDoorwayMapping> = [], errorThrown;
    try {
      doorwayMappings = await fetchAllObjects<DensityDoorwayMapping>(`/integrations/doorway_mappings/`, { cache: false });
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      dispatch(integrationsActions.doorwayMappingError(errorThrown));
    } else {
      const doorwayMappingsForService = doorwayMappings.filter(doorwayMapping => doorwayMapping.service_id === service.id);
      dispatch(integrationsActions.doorwayMappingComplete(doorwayMappingsForService));
    }
  }
}

export async function closeService(dispatch: DispatchType) {
  await hideModal(dispatch);
  dispatch(integrationsActions.closeService());
}

export const integrationsActions = {
  loadStarted: () => ({
    type: 'INTEGRATIONS_LOAD_START' as const,
  }),
  loadComplete: (data: Array<DensityService>) => ({
    type: 'INTEGRATIONS_LOAD_COMPLETE' as const,
    data,
  }),
  loadError: (error: any) => ({
    type: 'INTEGRATIONS_LOAD_ERROR' as const,
    error,
  }),

  openService: (service: DensityService) => ({
    type: 'INTEGRATIONS_SERVICE_OPEN' as const,
    service,
  }),
  closeService: () => ({
    type: 'INTEGRATIONS_SERVICE_CLOSE' as const,
  }),

  spaceMappingStart: () => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_START' as const,
  }),
  spaceMappingComplete: (spaceMappings: Array<DensityServiceSpace>) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_COMPLETE' as const,
    spaceMappings,
  }),
  spaceMappingError: (error: any) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_ERROR' as const,
    error,
  }),

  doorwayMappingStart: () => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_START' as const,
  }),
  doorwayMappingComplete: (doorwayMappings: Array<DensityDoorwayMapping>) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_COMPLETE' as const,
    doorwayMappings,
  }),
  doorwayMappingError: (error: any) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_ERROR' as const,
    error,
  }),
};
export type IntegrationsAction = ActionTypesOf<typeof integrationsActions>;
