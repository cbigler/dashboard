import core from '../../client/core';
import { showToast } from '../../rx-actions/toasts';

export const INTEGRATIONS_ROOM_BOOKING_SET_SERVICE = 'INTEGRATIONS_ROOM_BOOKING_SET_SERVICE';

export function integrationsRoomBookingSetService(service) {
  return { type: INTEGRATIONS_ROOM_BOOKING_SET_SERVICE, service };
}

export async function integrationsSpaceMappingUpdate(dispatch, service, space, serviceSpaceId) {
  // Decide if a spacemapping needs to be created or can be updated
  const activeSpaceMapping = space.spaceMappings.length > 0 ? space.spaceMappings[0] : null;

  let request;
  if (activeSpaceMapping) {
    request = core().put(`/integrations/space_mappings/${activeSpaceMapping.id}/`, {
      space_id: space.id,
      service_space_id: serviceSpaceId,
      service_id: service.id,
    });
  } else {
    request = core().post(`/integrations/space_mappings/`, {
      space_id: space.id,
      service_space_id: serviceSpaceId,
      service_id: service.id,
    });
  }

  try {
    await request;
  } catch (err) {
    console.error(err);
    showToast(dispatch, {type: 'error', text: 'Error mapping spaces'});
    return;
  }

  showToast(dispatch, {text: 'Space mapping complete'});
}
