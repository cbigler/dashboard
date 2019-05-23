import core from '../../client/core';
import showToast from '../toasts/index';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import { DensitySpaceMapping } from '../../types';

export const INTEGRATIONS_ROOM_BOOKING_SET_SERVICE = 'INTEGRATIONS_ROOM_BOOKING_SET_SERVICE';

export function integrationsRoomBookingSetService(service) {
  return { type: INTEGRATIONS_ROOM_BOOKING_SET_SERVICE, service };
}

export function integrationsSpaceMappingUpdate(service, spaceId, serviceSpaceId) {
  return async (dispatch, getState) => {
    // Decide if a spacemapping needs to be created or can be updated
    const currentSpace = getState().spaces.data.find(s => s.id === spaceId)  
    const activeSpaceMapping = currentSpace.spaceMappings.length > 0 ? currentSpace.spaceMappings[0] : null;
    
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
    dispatch(showToast({text: 'Space mapping complete'}));
  };
}
