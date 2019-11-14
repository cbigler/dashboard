export const EVENT_PUSHER_STATUS_CHANGE = 'EVENT_PUSHER_STATUS_CHANGE';

export default function eventPusherStatusChange(status) {
  return {
    type: EVENT_PUSHER_STATUS_CHANGE,
    status,
  };
}
