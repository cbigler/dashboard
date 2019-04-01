import core from '../../client/core';
import showToast from '../toasts/index';

import { integrationsRoomBookingSelectSpaceMapping } from './room-booking';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import { DensitySpaceMapping } from '../../types';

export const INTEGRATIONS_ROBIN_SPACES_SET = 'INTEGRATIONS_ROBIN_SPACES_SET',
             INTEGRATIONS_ROBIN_SPACES_ERROR = 'INTEGRATIONS_ROBIN_SPACES_ERROR',
             INTEGRATIONS_ROBIN_SPACES_SELECT = 'INTEGRATIONS_ROBIN_SPACES_SELECT';

export function integrationsRobinSpacesSet(data) {
  return { type: INTEGRATIONS_ROBIN_SPACES_SET, data };
}

export function integrationsRobinSpacesError(error) {
  return { type: INTEGRATIONS_ROBIN_SPACES_ERROR, error };
}

export function integrationsRobinSpacesSelect(id) {
  return { type: INTEGRATIONS_ROBIN_SPACES_SELECT, id };
}

export function integrationsSpaceMappingUpdate(service, spaceId, serviceSpaceId) {
  return async (dispatch, getState) => {
    // Decide if a spacemapping needs to be created or can be updated
    const activeSpaceMapping = getState().integrations.roomBooking.spaceMappingForActiveSpace;
    let request;
    if (activeSpaceMapping) {
      request = core().put(`/integrations/space_mappings/${activeSpaceMapping.id}/`, {
        space_id: spaceId,
        service_space_id: serviceSpaceId,
        service_id: service.id,
      });
    } else {
      request = core().post(`/integrations/space_mappings/`, {
        space_id: spaceId,
        service_space_id: serviceSpaceId,
        service_id: service.id,
      });
    }

    let spaceMappingResponse;
    try {
      spaceMappingResponse = await request;
    } catch (err) {
      console.error(err);
      dispatch(showToast({type: 'error', text: 'Error mapping spaces'}));
      return;
    }

    const spaceMapping = objectSnakeToCamel<DensitySpaceMapping>(spaceMappingResponse.data);
    dispatch(integrationsRoomBookingSelectSpaceMapping(spaceMapping));
    dispatch(showToast({text: 'Space mapping complete'}));
  };
}
