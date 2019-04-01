export const INTEGRATIONS_ROOM_BOOKING_SET_DEFAULT_SERVICE = 'INTEGRATIONS_ROOM_BOOKING_SET_DEFAULT_SERVICE',
             INTEGRATIONS_ROOM_BOOKING_SELECT_SPACE_MAPPING = 'INTEGRATIONS_ROOM_BOOKING_SELECT_SPACE_MAPPING';

export function integrationsRoomBookingSetDefaultService(service) {
  return { type: INTEGRATIONS_ROOM_BOOKING_SET_DEFAULT_SERVICE, service };
}

export function integrationsRoomBookingSelectSpaceMapping(data) {
  return { type: INTEGRATIONS_ROOM_BOOKING_SELECT_SPACE_MAPPING, data };
}
