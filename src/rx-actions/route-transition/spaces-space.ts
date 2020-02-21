import moment from 'moment-timezone';
import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';
import { CoreSensor } from '@density/lib-api-types/core-v2/sensors';
import fetchAllObjects from '../../helpers/fetch-all-objects';

import { spaceActions } from '../spaces';
import { doorwayActions } from '../doorways';
import { spacesPageActions } from '../spaces-page';
import spacesError from '../collection/spaces-legacy/error';
import spaceHierarchySet from '../collection/space-hierarchy/set';
import alertsRead from '../alerts/read';
import { loadDailyOccupancy } from '../spaces-page/operations';
import { sensorActions } from '../sensors';

export const ROUTE_TRANSITION_SPACES_SPACE = 'ROUTE_TRANSITION_SPACES_SPACE';

export default async function routeTransitionSpacesSpace(dispatch, id) {
  let errorThrown = false, doorways, spaces, spaceHierarchy, sensors, selectedSpace;
  dispatch(spacesPageActions.clearData());
  dispatch({ type: ROUTE_TRANSITION_SPACES_SPACE });

  // Optimistically set the selected space
  dispatch(spacesPageActions.setSelectedSpace(id));

  // Load all spaces and the hierarchy, which is fairly wasteful
  try {
    [doorways, spaces, spaceHierarchy, sensors] = await Promise.all([
      fetchAllObjects<CoreDoorway>('/doorways', { cache: false }),
      fetchAllObjects<CoreSpace>('/spaces', { cache: false }),
      fetchAllObjects<CoreSpaceHierarchyNode>('/spaces/hierarchy', { cache: false }),
      fetchAllObjects<CoreSensor>('/sensors', { cache: false }),
    ]);
  } catch (err) {
    errorThrown = true;
    dispatch(spacesError(`Error loading spaces: ${err}`));
  }
  if (!errorThrown) {
    dispatch(sensorActions.setAll(sensors));
    dispatch(doorwayActions.setAll(doorways));
    dispatch(spaceActions.setAll(spaces));
    dispatch(spaceHierarchySet(spaceHierarchy));
  }

  // Find the selected space in the downloaded data
  selectedSpace = spaces.find(s => s.id === id);
  if (!selectedSpace) {
    dispatch(spacesError(`Space with id ${id} not found`));
    return;
  }

  // Load alerts for this account
  await alertsRead(dispatch);

  // Load daily occupancy data
  const today = moment().format('YYYY-MM-DD');
  dispatch(spacesPageActions.setDailyDate(today));
  await loadDailyOccupancy(dispatch, selectedSpace, today);

  // Load first page of raw events
  dispatch(spacesPageActions.setRawEvents({page: 1}));
}
