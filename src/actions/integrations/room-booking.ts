import core from '../../client/core';
import showToast from '../toasts/index';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import { DensitySpaceMapping } from '../../types';

export const INTEGRATIONS_ROOM_BOOKING_SET_DEFAULT_SERVICE = 'INTEGRATIONS_ROOM_BOOKING_SET_DEFAULT_SERVICE',
             INTEGRATIONS_ROOM_BOOKING_SELECT_SPACE_MAPPING = 'INTEGRATIONS_ROOM_BOOKING_SELECT_SPACE_MAPPING';

export function integrationsRoomBookingSetDefaultService(service) {
  return { type: INTEGRATIONS_ROOM_BOOKING_SET_DEFAULT_SERVICE, service };
}

export function integrationsRoomBookingSelectSpaceMapping(data) {
  return { type: INTEGRATIONS_ROOM_BOOKING_SELECT_SPACE_MAPPING, data };
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


export const INTEGRATIONS_ROOM_BOOKING_SPACES_SET = 'INTEGRATIONS_ROOM_BOOKING_SPACES_SET',
             INTEGRATIONS_ROOM_BOOKING_SPACES_ERROR = 'INTEGRATIONS_ROOM_BOOKING_SPACES_ERROR',
             INTEGRATIONS_ROOM_BOOKING_SPACES_SELECT = 'INTEGRATIONS_ROOM_BOOKING_SPACES_SELECT';

export function integrationsRoomBookingSpacesSet(data, service) {
  return { type: INTEGRATIONS_ROOM_BOOKING_SPACES_SET, data, service };
}

export function integrationsRoomBookingSpacesError(error, service) {
  return { type: INTEGRATIONS_ROOM_BOOKING_SPACES_ERROR, error, service };
}

export function integrationsRoomBookingSpacesSelect(id) {
  return { type: INTEGRATIONS_ROOM_BOOKING_SPACES_SELECT, id };
}
