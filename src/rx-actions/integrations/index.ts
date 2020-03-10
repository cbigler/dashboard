import { CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces'; 
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways'; 
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
import core from '../../client/core';

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
      dispatch(integrationsActions.spaceMappingComplete(
        spaceMappings,
        serviceSpaces,
        hierarchy,
      ));
    }
  }

  if (serviceRenderingPreferences.doorwayMappings.enabled) {
    dispatch(integrationsActions.doorwayMappingStart());

    // FIXME: why don't these types work?
    let doorwayMappings: any,//Array<DensityDoorwayMapping> = [],
        serviceDoorways: any,//Array<AbstractServiceDoorway> = [],
        doorways: any,//Array<CoreDoorway> = [],
        errorThrown;
    try {
      [doorways, doorwayMappings, serviceDoorways] = await Promise.all([
        fetchAllObjects<CoreDoorway>(`/doorways/`, { cache: false }),
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
      dispatch(integrationsActions.doorwayMappingComplete(doorwayMappingsForService, serviceDoorways, doorways));
    }
  }
}

export async function closeService(dispatch: DispatchType) {
  await hideModal(dispatch);
  dispatch(integrationsActions.closeService());
}

export async function spaceMappingsAdd(dispatch: DispatchType, serviceId: string, spaceId: string, serviceSpaceId: string) {
  let response, errorThrown;
  try {
    response = await core().post(`/integrations/space_mappings/`, {
      "service_id": serviceId,
      "space_id": spaceId,
      "service_space_id": serviceSpaceId,
    });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error('ERROR', errorThrown);
    return;
  }

  dispatch(integrationsActions.spaceMappingsAdd(response.data.id, spaceId, serviceSpaceId));
}

export async function spaceMappingsUpdate(dispatch: DispatchType, spaceMappingId: string, spaceId: string, serviceSpaceId: string) {
  let errorThrown;
  try {
    await core().put(`/integrations/space_mappings/${spaceMappingId}/`, {
      "space_id": spaceId,
      "service_space_id": serviceSpaceId,
    });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error('ERROR', errorThrown);
    return;
  }

  dispatch(integrationsActions.spaceMappingUpdateComplete(spaceMappingId));
}

export async function spaceMappingsDelete(dispatch: DispatchType, spaceMappingId: string) {
  let errorThrown;
  try {
    await core().delete(`/integrations/space_mappings/${spaceMappingId}/`);
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error('ERROR', errorThrown);
    return;
  }

  dispatch(integrationsActions.spaceMappingDeleteComplete(spaceMappingId));
}

export async function doorwayMappingsAdd(dispatch: DispatchType, serviceId: string, doorwayId: string, serviceDoorwayId: string) {
  let response, errorThrown;
  try {
    response = await core().post(`/integrations/doorway_mappings/`, {
      "service_id": serviceId,
      "doorway_id": doorwayId,
      "service_doorway_id": serviceDoorwayId,
    });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error('ERROR', errorThrown);
    return;
  }

  dispatch(integrationsActions.doorwayMappingsAdd(response.data.id, doorwayId, serviceDoorwayId));
}

export async function doorwayMappingsUpdate(dispatch: DispatchType, doorwayMappingId: string, doorwayId: string, serviceDoorwayId: string) {
  let errorThrown;
  try {
    await core().put(`/integrations/doorway_mappings/${doorwayMappingId}/`, {
      "doorway_id": doorwayId,
      "service_doorway_id": serviceDoorwayId,
    });
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error('ERROR', errorThrown);
    return;
  }

  dispatch(integrationsActions.doorwayMappingUpdateComplete(doorwayMappingId));
}

export async function doorwayMappingsDelete(dispatch: DispatchType, doorwayMappingId: string) {
  let errorThrown;
  try {
    await core().delete(`/integrations/doorway_mappings/${doorwayMappingId}/`);
  } catch (err) {
    errorThrown = err;
  }

  if (errorThrown) {
    console.error('ERROR', errorThrown);
    return;
  }

  dispatch(integrationsActions.doorwayMappingDeleteComplete(doorwayMappingId));
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

  //
  // SPACE MAPPINGS
  //
  spaceMappingStart: () => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_START' as const,
  }),
  spaceMappingComplete: (
    spaceMappings: Array<DensitySpaceMapping>,
    serviceSpaces: Array<DensityServiceSpace>,
    hierarchy: Array<CoreSpaceHierarchyNode>
  ) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_COMPLETE' as const,
    spaceMappings,
    serviceSpaces,
    hierarchy,
  }),
  spaceMappingError: (error: any) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_ERROR' as const,
    error,
  }),
  spaceMappingsAdd: (id: string, spaceId: string, serviceSpaceId: string) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_ADD' as const,
    id,
    spaceId,
    serviceSpaceId,
  }),

  spaceMappingBeginLoading: (id: DensitySpaceMapping['id']) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_BEGIN_LOADING' as const,
    id,
  }),

  spaceMappingChangeNewSpaceId: (value: string) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_CHANGE_NEW_DENSITY_SPACE_ID' as const,
    value,
  }),
  spaceMappingChangeServiceSpaceId: (value: string) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_CHANGE_NEW_SERVICE_SPACE_ID' as const,
    value,
  }),

  spaceMappingUpdateChangeDensitySpaceId: (id: DensitySpaceMapping['id'], spaceId: string) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_UPDATE_CHANGE_DENSITY_SPACE_ID' as const,
    id,
    spaceId,
  }),
  spaceMappingUpdateChangeServiceSpaceId: (id: DensitySpaceMapping['id'], serviceSpaceId: string) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_UPDATE_CHANGE_SERVICE_SPACE_ID' as const,
    id,
    serviceSpaceId,
  }),

  spaceMappingUpdateComplete: (id: DensitySpaceMapping['id']) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_UPDATE_COMPLETE' as const,
    id,
  }),

  spaceMappingDeleteComplete: (id: DensitySpaceMapping['id']) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_DELETE_COMPLETE' as const,
    id,
  }),

  //
  // DOORWAY MAPPINGS
  //
  doorwayMappingStart: () => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_START' as const,
  }),
  doorwayMappingComplete: (doorwayMappings: Array<DensityDoorwayMapping>, serviceDoorways: Array<AbstractServiceDoorway>, doorways: Array<CoreDoorway>) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_COMPLETE' as const,
    doorwayMappings,
    serviceDoorways,
    doorways,
  }),
  doorwayMappingError: (error: any) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_ERROR' as const,
    error,
  }),

  doorwayMappingsAdd: (id: string, doorwayId: string, serviceDoorwayId: string) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_ADD' as const,
    id,
    doorwayId,
    serviceDoorwayId,
  }),

  doorwayMappingBeginLoading: (id: DensityDoorwayMapping['id']) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_BEGIN_LOADING' as const,
    id,
  }),

  doorwayMappingChangeNewDoorwayId: (value: string) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_CHANGE_NEW_DENSITY_DOORWAY_ID' as const,
    value,
  }),
  doorwayMappingChangeServiceDoorwayId: (value: string) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_CHANGE_NEW_SERVICE_DOORWAY_ID' as const,
    value,
  }),

  doorwayMappingUpdateChangeDensityDoorwayId: (id: DensityDoorwayMapping['id'], doorwayId: string) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_UPDATE_CHANGE_DENSITY_DOORWAY_ID' as const,
    id,
    doorwayId,
  }),
  doorwayMappingUpdateChangeServiceDoorwayId: (id: DensityDoorwayMapping['id'], serviceDoorwayId: string) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_UPDATE_CHANGE_SERVICE_DOORWAY_ID' as const,
    id,
    serviceDoorwayId,
  }),

  doorwayMappingUpdateComplete: (id: DensityDoorwayMapping['id']) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_UPDATE_COMPLETE' as const,
    id,
  }),

  doorwayMappingDeleteComplete: (id: DensityDoorwayMapping['id']) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_DELETE_COMPLETE' as const,
    id,
  }),
};
export type IntegrationsAction = ActionTypesOf<typeof integrationsActions>;
