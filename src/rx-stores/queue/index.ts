import { forkJoin, of, from } from 'rxjs';
import {
  filter,
  take,
  map,
  switchMap,
} from 'rxjs/operators';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
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
import { QueueActionTypes } from '../../rx-actions/queue';
import fetchAllObjects, { fetchObject } from '../../helpers/fetch-all-objects';
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
  selected: Resource<{
    space: CoreSpace,
    spaceDwellMean: number,
    virtualSensorSerial: string,
    settings: QueueSettings
  }>,
}

const initialState: QueueState = {
  orgSettings: {} as QueueSettings,
  selected: RESOURCE_IDLE,
  tallyEnabled: localStorage.getItem('queueTallyEnabled') === 'true'
};


export function queueReducer(state: QueueState, action: GlobalAction): QueueState {
  switch (action.type) {
  case QueueActionTypes.QUEUE_DETAIL_DATA_LOADED:
    return {
      ...state,
      selected: {
        data: {
          space: action.space,
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
  default:
    return state;
  }

}

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

        // if the space ID exists as a key within the org settings,
        // it should be used as an override.
        if (action.id in settings) {
          settings = settings[action.id];
        }

        return [action, settings] as [any, QueueSettings]
      })
    )),
    switchMap(([action, settings]) => forkJoin(
      // pull the space
      fetchSelectedSpace(action.id),
      // pull the space dwell
      fetchSelectedSpaceDwell(action.id),
      // pull the sensor
      fetchSelectedSensorSerial(action.id),
      // pass through the settings
      of(settings)
    ))
  )
  .subscribe(([space, spaceDwellMean, virtualSensorSerial, settings]) => {
      return rxDispatch({
        type: QueueActionTypes.QUEUE_DETAIL_DATA_LOADED,
        space,
        spaceDwellMean,
        virtualSensorSerial,
        settings
      });
  });

function fetchSelectedSpace(spaceId: string) {
  return fetchObject<CoreSpace>(`/spaces/${spaceId}`, { cache: false });
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
  .subscribe((result: any) => {
    console.log(result);
  });


const QueueStore = createRxStore('QueueStore', initialState, queueReducer);
export default QueueStore;
