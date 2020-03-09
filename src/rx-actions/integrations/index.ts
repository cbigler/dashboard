import { CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces'; 
import {
  DensityService,
  DensityServiceSpace,
  DensityDoorwayMapping,
  DensitySpaceMapping,
} from '../../types';
import { ActionTypesOf } from '..';
import { DispatchType } from '../../types/rx-actions';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';

import fetchAllObjects from '../../helpers/fetch-all-objects';

import {
  ServiceRenderingPreferences,
  AbstractServiceDoorway,
} from '../../types/integrations';

export const INTEGRATIONS_MODAL_NAME = 'integration-details';

export async function openService(
  dispatch: DispatchType,
  service: DensityService,
  serviceRenderingPreferences: ServiceRenderingPreferences,
) {
  dispatch(integrationsActions.openService(service));
  showModal(dispatch, INTEGRATIONS_MODAL_NAME);

  if (serviceRenderingPreferences.spaceMappings.enabled) {
    dispatch(integrationsActions.spaceMappingStart());

    let serviceSpaces: Array<DensityServiceSpace> = [],
        spaceMappings: Array<DensitySpaceMapping> = [],
        hierarchy: Array<CoreSpaceHierarchyNode> = [],
        errorThrown;
    try {
      [serviceSpaces, spaceMappings, hierarchy] = await Promise.all([
        fetchAllObjects<DensityServiceSpace>(`/integrations/${service.name}/spaces/`, { cache: false }),
        fetchAllObjects<DensitySpaceMapping>(`/integrations/space_mappings/`, { cache: false }),
        fetchAllObjects<CoreSpaceHierarchyNode>(`/spaces/hierarchy/`, { cache: false }),
      ]);
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      dispatch(integrationsActions.spaceMappingError(errorThrown));
    } else {
      dispatch(integrationsActions.spaceMappingComplete(spaceMappings, serviceSpaces, hierarchy));
    }
  }

  if (serviceRenderingPreferences.doorwayMappings.enabled) {
    dispatch(integrationsActions.doorwayMappingStart());

    let doorwayMappings: Array<DensityDoorwayMapping> = [],
        serviceDoorways: Array<AbstractServiceDoorway> = [],
        errorThrown;
    try {
      [doorwayMappings, serviceDoorways] = await Promise.all([
        fetchAllObjects<DensityDoorwayMapping>(`/integrations/doorway_mappings/`, { cache: false }),
        serviceRenderingPreferences.doorwayMappings.fetchServiceDoorways(service),
      ]);
    } catch (err) {
      errorThrown = err;
    }

    if (errorThrown) {
      dispatch(integrationsActions.doorwayMappingError(errorThrown));
    } else {
      const doorwayMappingsForService = doorwayMappings.filter(doorwayMapping => doorwayMapping.service_id === service.id);
      dispatch(integrationsActions.doorwayMappingComplete(doorwayMappingsForService, serviceDoorways));
    }
  }
}

export async function closeService(dispatch: DispatchType) {
  await hideModal(dispatch);
  dispatch(integrationsActions.closeService());
}

export async function spaceMappingsAdd(dispatch: DispatchType) {
  dispatch(integrationsActions.spaceMappingsAdd());
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
  spaceMappingComplete: (spaceMappings: Array<DensitySpaceMapping>, serviceSpaces: Array<DensityServiceSpace>, hierarchy: Array<CoreSpaceHierarchyNode>) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_COMPLETE' as const,
    spaceMappings,
    serviceSpaces,
    hierarchy,
  }),
  spaceMappingError: (error: any) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_ERROR' as const,
    error,
  }),
  spaceMappingsAdd: () => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_ADD' as const,
  }),

  spaceMappingChangeNewSpaceId: (value: string) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_CHANGE_NEW_DENSITY_SPACE_ID' as const,
    value,
  }),
  spaceMappingChangeServiceSpaceId: (value: string) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_CHANGE_NEW_SERVICE_SPACE_ID' as const,
    value,
  }),

  doorwayMappingStart: () => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_START' as const,
  }),
  doorwayMappingComplete: (doorwayMappings: Array<DensityDoorwayMapping>, serviceDoorways: Array<AbstractServiceDoorway>) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_COMPLETE' as const,
    doorwayMappings,
    serviceDoorways,
  }),
  doorwayMappingError: (error: any) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_ERROR' as const,
    error,
  }),
};
export type IntegrationsAction = ActionTypesOf<typeof integrationsActions>;
