import { forkJoin } from 'rxjs';
import {
  filter,
  take,
  map,
  switchMap,
} from 'rxjs/operators';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

import createRxStore, { actions, rxDispatch } from '..';
import UserStore, { UserState } from '../user';
import {
  Resource,
  RESOURCE_IDLE,
} from '../../types/resource';
import { GlobalAction } from '../../types/rx-actions';
import { QueueActionTypes, QueueAction } from '../../rx-actions/queue';
import { fetchObject } from '../../helpers/fetch-all-objects';


export type QueueSettings = {

}

export type QueueState = {
  orgSettings: QueueSettings,
  selected: Resource<{
    space: CoreSpace,
    virtualSensorSerial: string,
    settings: QueueSettings
  }>,
}

const initialState: QueueState = {
  orgSettings: {} as QueueSettings,
  selected: RESOURCE_IDLE,
};

export function queueReducer(state: QueueState, action: GlobalAction): QueueState {
  switch (action.type) {
  // case 'SELECT_SPACE':
  //   return {
  //     ...state,
  //     selected: {
  //       data: {
  //         space: action.space,
  //         virtualSensor: action.virtualSensor,
  //         settings: action.settings,
  //       },
  //       status: ResourceStatus.COMPLETE
  //     },
  //   };

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
      console.log('asf')
      return action.type === QueueActionTypes.ROUTE_TRANSITION_QUEUE_SPACE_DETAIL
    }),
    switchMap((action: any) => UserStore.pipe(
      take(1),
      map((user) => {
        const orgSettings = user.data?.organization.settings['queue_settings']
        return [action, orgSettings] as [any, QueueSettings]
      })
    )),
    switchMap(([action, orgSettings]) => forkJoin(
      // pull the space
      fetchObject<CoreSpace>(`/spaces/${action.id}`, { cache: false })
      // pull the sensor - doorways, filter by space_id, get serial
      // pull the settings
    )),
  ).subscribe((data) => {
    console.log(data);
  });


const QueueStore = createRxStore('QueueStore', initialState, queueReducer);
export default QueueStore;
