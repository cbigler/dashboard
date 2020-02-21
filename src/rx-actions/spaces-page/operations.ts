import moment from 'moment-timezone';
import core from '../../client/core';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { DispatchType } from '../../types/rx-actions';

import { spacesPageActions } from '.';
import { getGoSlow } from '../../components/environment-switcher';
import { SpacesPageState } from '../../rx-stores/spaces-page/reducer';
import { SpacesState } from '../../rx-stores/spaces';

export async function loadDailyOccupancy(dispatch: DispatchType, space: CoreSpace, date: string) {
  dispatch(spacesPageActions.setDailyDate(date));
  
  const localDate = moment.tz(date, space.time_zone);
  const response = await core().get(`/spaces/${space.id}/counts`, {
    params: {
      interval: '5m',
      order: 'asc',
      start_time: localDate.clone().startOf('day').toISOString(),
      end_time: localDate.clone().startOf('day').add(1, 'day').toISOString(),
      page_size: 5000,
      slow: getGoSlow(),
    }
  });

  if (typeof response.data.metrics === 'undefined') {
    throw new Error(`Response did not contain .metrics key! (data=${response.data})`);
  }
  if (typeof response.data.results === 'undefined') {
    throw new Error(`Response did not contain .results key! (data=${response.data})`);
  }

  dispatch(spacesPageActions.setDailyOccupancy(response.data.results.reverse(), response.data.metrics));
}

export async function loadRawEvents(dispatch: DispatchType, spaces: SpacesState, spacesPage: SpacesPageState) {
  if (!spacesPage.spaceId) { return; }
  const selectedSpace = spaces.data.get(spacesPage.spaceId);
  if (!selectedSpace) { return; }

  try {
    const response = await core().get(`/spaces/${spacesPage.spaceId}/events`, {
      params: {
        start_time: moment.tz(spacesPage.startDate, selectedSpace.time_zone).toISOString(),
        end_time: moment.tz(spacesPage.endDate, selectedSpace.time_zone).add(1, 'days').toISOString(),
        page: spacesPage.rawEvents.page,
        page_size: 10,
        order: 'DESC',
        doorway_id: spacesPage.doorwayId || undefined,
        count: true,
      }
    });
    if (typeof response.data.results === 'undefined') {
      throw new Error(`Response did not contain .results key! (data=${response.data})`);
    } else {
      dispatch(spacesPageActions.setRawEvents({
        data: response.data.results,
        totalEvents: response.data.total,
        status: 'COMPLETE',
      }));
    }
  } catch (error) {
    dispatch(spacesPageActions.setRawEvents({
      data: [],
      totalEvents: 0,
      status: 'ERROR',
    }));
  }
}
