import { forkJoin, of, from, Observable, interval } from 'rxjs';
import {
  filter,
  take,
  map,
  switchMap,
  takeUntil
} from 'rxjs/operators';
// import * as moment from 'moment';
import moment from 'moment-timezone';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { CoreWebsocketEventPayload, CoreSpaceEvent } from '@density/lib-api-types/core-v2/events';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';

import core from '../../client/core';
import createRxStore, { actions, rxDispatch } from '..';
import UserStore from '../user';
import {
  Resource,
  RESOURCE_IDLE,
  ResourceStatus,
} from '../../types/resource';
import { GlobalAction } from '../../types/rx-actions';
import { QueueActionTypes, QUEUE_SOCKET_CONNECTION_STATES } from '../../rx-actions/queue';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';
import WebsocketEventPusher from '../../helpers/websocket-event-pusher/index';
import { isNullOrUndefined } from 'util';


export type QueueSettings = {
  display_wait_time: boolean
  go_cooldown_seconds: number
  message: string
  queue_capacity: number
  threshold_metric: "CAPACITY"|"UTILIZATION"|"PEOPLE_PER_SQFT"
  threshold_value: number
  support_email: string
}

export type QueueState = {
  orgSettings: QueueSettings,
  tallyEnabled: boolean,
  websocketState: QUEUE_SOCKET_CONNECTION_STATES,
  selected: Resource<{
    space: CoreSpace,
    spaceEvents: CoreSpaceEvent[],
    spaceDwellMean: number,
    virtualSensorSerial: string,
    settings: QueueSettings
  }>,
}

const initialState: QueueState = {
  orgSettings: {} as QueueSettings,
  selected: RESOURCE_IDLE,
  tallyEnabled: localStorage.getItem('queueTallyEnabled') === 'true',
  websocketState: QUEUE_SOCKET_CONNECTION_STATES.CLOSED
};

const websocketPusher = new WebsocketEventPusher();

export function queueReducer(state: QueueState, action: GlobalAction): QueueState {
  switch (action.type) {
  case QueueActionTypes.QUEUE_DETAIL_DATA_LOADED:
    return {
      ...state,
      selected: {
        data: {
          space: action.space,
          spaceEvents: action.spaceEvents,
          spaceDwellMean: action.spaceDwellMean,
          virtualSensorSerial: action.virtualSensorSerial,
          settings: action.settings,
        },
        status: ResourceStatus.COMPLETE
      },
    };
  case QueueActionTypes.QUEUE_SET_TALLY_ENABLED:
    return {
      ...state,
      tallyEnabled: action.enabled
    }
  case QueueActionTypes.QUEUE_WEBSOCKET_STATUS_CHANGE:
    return {
      ...state,
      websocketState: action.state
    }
  case QueueActionTypes.QUEUE_WEBSOCKET_COUNT_CHANGE:
    if (state.selected.status !== ResourceStatus.COMPLETE) {
      return state;
    }

    return {
      ...state,
      selected: {
        ...state.selected,
        data: {
          ...state.selected.data,
          space: {
            ...state.selected.data.space,
            current_count: action.currentCount
          },
          spaceEvents: [...state.selected.data.spaceEvents, action.newEvent]
        }
      }
    }
  default:
    return state;
  }

}

const unmount = actions.pipe(
  filter(action => {
    return action.type === QueueActionTypes.QUEUE_WILL_UNMOUNT
  }));

// =================================
// SIDE EFFECT: when the detail page is loaded
// grab the selected space, selected sensor, and optionally overriding
// space settings
// =================================
actions
  .pipe(
    filter(action => {
      return action.type === QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL
    }),
    switchMap((action: any) => UserStore.pipe(
      take(1),
      map((user) => {
        let settings = user.data?.organization.settings['queue_settings'];
        if (isNullOrUndefined(settings)) {
          console.error('no queue settings defined');
          settings = {};
        }

        // if the space ID exists as a key within the org settings, use that
        // otherwise use the default.
        if (action.id in settings) {
          settings = settings[action.id];
        }
        else {
          settings = settings.hasOwnProperty('default') ? settings['default'] : {};
        }

        return [action, settings] as [any, QueueSettings]
      })
    )),
    switchMap(([action, settings]) => forkJoin(
      // pull the space and its events
      fetchSelectedSpaceAndEvents(action.id),
      // pull the space dwell
      fetchSelectedSpaceDwell(action.id),
      // pull the sensor
      fetchSelectedSensorSerial(action.id),
      // pass through the settings
      of(settings),
    ))
  )
  .subscribe(([
    [space, spaceEvents],
    spaceDwellMean,
    virtualSensorSerial,
    settings
  ]) => {
      websocketPusher.connect();

      return rxDispatch({
        type: QueueActionTypes.QUEUE_DETAIL_DATA_LOADED,
        space,
        spaceEvents,
        spaceDwellMean,
        virtualSensorSerial,
        settings
      });
  });


function fetchSelectedSpaceAndEvents(spaceId: string) {
  return from(fetchObject<CoreSpace>(`/spaces/${spaceId}`, { cache: false })).pipe(
    switchMap((space) => forkJoin(
      of(space),
      fetchSelectedSpaceEvents(space)
    ))
  );
}

function fetchSelectedSpaceEvents(space: CoreSpace) {
  const localNow = moment.tz(space.time_zone);
  const resetTime = moment(space.daily_reset, 'HH:mm');
  const resetTimestamp = localNow.clone()
    .hour(resetTime.hour())
    .minute(resetTime.minute())
    .second(0)
    .millisecond(0);
  if (resetTimestamp > localNow) { resetTimestamp.subtract(1, 'day'); }

  return fetchAllObjects<CoreSpaceEvent>(`/spaces/${space.id}/events`, {
    params: {
      start_time: resetTimestamp.utc().toISOString(),
      end_time: localNow.utc().toISOString(),
    }
  });
}

function fetchSelectedSpaceDwell(spaceId: string) {
  return from(fetchObject(`/spaces/${spaceId}/dwell`, { cache: false })).pipe(
    map((spaceDwell) => spaceDwell.mean)
  );
}

function fetchSelectedSensorSerial(spaceId: string) {
  return from(fetchAllObjects<CoreDoorway>(`/doorways/`, {
    params: {space_id: spaceId}, cache: false
  })).pipe(
    map((doorways)=> {
       const hasSensors = doorways.filter((d) => !isNullOrUndefined(d.sensor_serial_number))

       if (hasSensors.length) {
         return hasSensors[0].sensor_serial_number
       }
      else {
        console.error('no suitable sensors found');
        return '';
      }
    })
  );
}

// =================================
// SIDE EFFECT: refresh the space count / events every
// minute, to make sure that stuff is up to date and
// resets are accounted for
// =================================
const refreshInterval = 60 * 1000;

actions
  .pipe(
    filter(action => {
      return action.type === QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL
    }),
    switchMap((action: any)=> interval(refreshInterval).pipe(map(()=> action))),
    takeUntil(unmount),
    switchMap((action: any)=> fetchSelectedSpaceAndEvents(action.id))
  ).subscribe();

// =================================
// SIDE EFFECT: disconnect from the websocket server on unmount
// =================================

unmount.subscribe(()=> {
  websocketPusher.disconnect()
});


// =================================
// SIDE EFFECT: map websocket state to store
// =================================
new Observable(subscriber => {
  websocketPusher.on('connectionStateChange', (state) => subscriber.next(state));
})
  .subscribe((socketConnectionState: any) => {

    return rxDispatch({
      type: QueueActionTypes.QUEUE_WEBSOCKET_STATUS_CHANGE,
      state: socketConnectionState
    })
  });

// =================================
// SIDE EFFECT: subscribe to websocket count changes for the selected space
// =================================
new Observable(subscriber => {
  websocketPusher.on('space', (spaceCountChange) => {
    subscriber.next(spaceCountChange);
  });
}).pipe(
  switchMap((spaceCountChange: any)=> { return forkJoin(
    of(spaceCountChange),
    QueueStore.pipe(take(1)),
  )}),
  filter(([spaceCountChange, queueStore]) => {
    if (queueStore.selected.status !== ResourceStatus.COMPLETE) {
      return false
    }

    return spaceCountChange.space_id === queueStore.selected.data.space.id
  })
).subscribe(([spaceCountChange, _]: [CoreWebsocketEventPayload, unknown]) => {
  rxDispatch({
    type: QueueActionTypes.QUEUE_WEBSOCKET_COUNT_CHANGE,
    currentCount: spaceCountChange.count,
    newEvent: {
      direction: spaceCountChange.direction,
      timestamp: spaceCountChange.timestamp
    } as CoreSpaceEvent
  })
});

// =================================
// SIDE EFFECT: update local storage when the tally enabled
// value changes. Initial load pulls from local storage
// =================================
actions
  .pipe(
    filter(action => {
      return action.type === QueueActionTypes.QUEUE_SET_TALLY_ENABLED
    })
  )
  .subscribe((action: any) => {
    localStorage.setItem('queueTallyEnabled', action.enabled ? 'true' : 'false')
  });

// =================================
// SIDE EFFECT: POST queue events
// =================================
actions
  .pipe(
    filter(action => {
      return action.type === QueueActionTypes.QUEUE_CREATE_TALLY_EVENT
    }),
    switchMap((action: any) => {
      return core().post(`/sensors/${action.virtualSensorSerial}/events`, {
        trajectory: action.trajectory,
        timestamp: action.timestamp.utc(),
      });
    })
  )
  // events are consumed via the websocket server
  .subscribe();


const QueueStore = createRxStore('QueueStore', initialState, queueReducer);
export default QueueStore;
