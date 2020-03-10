import { CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces'; 
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways'; 
import {
  DensityService,
  DensityServiceSpace,
  DensityDoorwayMapping,
  DensitySpaceMapping,
  DensityServiceAuthorization,
} from '../../types';
import { ActionTypesOf } from '..';
import { DispatchType } from '../../types/rx-actions';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';
import { showToast } from '../../rx-actions/toasts';

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

  if (serviceRenderingPreferences.spaceMappings.enabled && typeof service.service_authorization.id !== 'undefined') {
    dispatch(integrationsActions.spaceMappingLoadStart());

    let serviceSpaces: Array<DensityServiceSpace> = [],
        spaceMappings: Array<DensitySpaceMapping> = [],
        hierarchy: Array<CoreSpaceHierarchyNode> = [],
        errorThrown: any;

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
      dispatch(integrationsActions.spaceMappingLoadError(errorThrown));
    } else {
      dispatch(integrationsActions.spaceMappingLoadComplete(
        spaceMappings,
        serviceSpaces,
        hierarchy,
      ));
    }
  }

  if (serviceRenderingPreferences.doorwayMappings.enabled && typeof service.service_authorization.id !== 'undefined') {
    dispatch(integrationsActions.doorwayMappingLoadStart());

    // FIXME: why don't these types work?
    let doorwayMappings: Any<FixInRefactor>,//Array<DensityDoorwayMapping> = [],
        serviceDoorways: Any<FixInRefactor>,//Array<AbstractServiceDoorway> = [],
        doorways: Any<FixInRefactor>,//Array<CoreDoorway> = [],
        errorThrown: any;

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
      dispatch(integrationsActions.doorwayMappingLoadError(errorThrown));
    } else {
      const doorwayMappingsForService = doorwayMappings.filter(doorwayMapping => doorwayMapping.service_id === service.id);
      dispatch(integrationsActions.doorwayMappingLoadComplete(doorwayMappingsForService, serviceDoorways, doorways));
    }
  }
}

export async function closeService(dispatch: DispatchType) {
  await hideModal(dispatch);
  dispatch(integrationsActions.closeService());
}

export async function servicesList(dispatch) {
  let response;
  try {
    response = await core().get('/integrations/services/');
  } catch (err) {
    dispatch(integrationsActions.loadError('There was an error fetching your integrations - please contact support.'));
    return false;
  }

  dispatch(integrationsActions.loadComplete(response.data));
  return true;
}

export async function serviceAuthorizationMakeDefault(dispatch: DispatchType, serviceAuthorization: DensityServiceAuthorization) {
  try {
    await core().put(`/integrations/service_authorizations/${serviceAuthorization.id}/`, {'default': true});
  } catch (err) {
    showToast(dispatch, {
      type: 'error',
      text: `Error updating service authorization`,
    });
    return;
  }

  const ok = await servicesList(dispatch);
  if (ok) {
    showToast(dispatch, { text: `Successfully set default` });
  }
}

export async function serviceAuthorizationDelete(dispatch: DispatchType, serviceAuthorization: DensityServiceAuthorization) {
  try {
    await core().delete(`/integrations/service_authorizations/${serviceAuthorization.id}/`);
  } catch (err) {
    showToast(dispatch, {
      type: 'error',
      text: `Failed to remove integration!`,
    });
    return;
  }

  closeService(dispatch);

  const ok = await servicesList(dispatch);
  if (ok) {
    showToast(dispatch, {
      text: `Removed integration.`,
    });
  }
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
  spaceMappingLoadStart: () => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_LOAD_START' as const,
  }),
  spaceMappingLoadComplete: (
    spaceMappings: Array<DensitySpaceMapping>,
    serviceSpaces: Array<DensityServiceSpace>,
    hierarchy: Array<CoreSpaceHierarchyNode>
  ) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_LOAD_COMPLETE' as const,
    spaceMappings,
    serviceSpaces,
    hierarchy,
  }),
  spaceMappingLoadError: (error: any) => ({
    type: 'INTEGRATIONS_SERVICE_SPACE_MAPPINGS_LOAD_ERROR' as const,
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
  doorwayMappingLoadStart: () => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_LOAD_START' as const,
  }),
  doorwayMappingLoadComplete: (doorwayMappings: Array<DensityDoorwayMapping>, serviceDoorways: Array<AbstractServiceDoorway>, doorways: Array<CoreDoorway>) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_LOAD_COMPLETE' as const,
    doorwayMappings,
    serviceDoorways,
    doorways,
  }),
  doorwayMappingLoadError: (error: any) => ({
    type: 'INTEGRATIONS_SERVICE_DOORWAY_MAPPINGS_LOAD_ERROR' as const,
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
