import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';
import { CoreSensor } from '@density/lib-api-types/core-v2/sensors';
import fetchAllObjects from '../../helpers/fetch-all-objects';

import { spaceActions } from '../spaces';
import { doorwayActions } from '../doorways';
import { spacesPageActions } from '../spaces-page';
import spacesError from '../collection/spaces-legacy/error';
import spaceHierarchySet from '../collection/space-hierarchy/set';
import { sensorActions } from '../sensors';
import { DensityDoorwayMapping } from '../../types';


export const ROUTE_TRANSITION_SPACES_DOORWAY = 'ROUTE_TRANSITION_SPACES_DOORWAY';

export default async function routeTransitionSpacesDoorway(dispatch, space_id, doorway_id) {
  let errorThrown = false, doorways, spaces, spaceHierarchy, sensors, doorwayMappings, selectedSpace;
  dispatch(spacesPageActions.clearData());
  dispatch({ type: ROUTE_TRANSITION_SPACES_DOORWAY });

  // Optimistically set selected space and doorway
  dispatch(spacesPageActions.setSelectedDoorway(space_id, doorway_id));

  // Load all spaces and the hierarchy, which is fairly wasteful
  try {
    [doorways, spaces, spaceHierarchy, sensors, doorwayMappings] = await Promise.all([
      fetchAllObjects<CoreDoorway>('/doorways', { cache: false }),
      fetchAllObjects<CoreSpace>('/spaces', { cache: false }),
      fetchAllObjects<CoreSpaceHierarchyNode>('/spaces/hierarchy', { cache: false }),
      fetchAllObjects<CoreSensor>('/sensors', { cache: false }),
      fetchAllObjects<DensityDoorwayMapping>('/integrations/doorway_mappings', { cache: false }),
    ]);
  } catch (err) {
    errorThrown = true;
    dispatch(spacesError(`Error loading data: ${err}`));
  }
  if (!errorThrown) {
    dispatch(sensorActions.setAll(sensors));
    dispatch(doorwayActions.setAll(doorways));
    dispatch(spaceActions.setAll(spaces));
    dispatch(spacesPageActions.setDoorwayMappings(doorwayMappings));
    dispatch(spaceHierarchySet(spaceHierarchy));
  }

  // Find the selected space in the downloaded data
  selectedSpace = spaces.find(s => s.id === space_id);
  if (!selectedSpace) {
    dispatch(spacesError(`Space with id ${space_id} not found`));
    return;
  }
  // Also find the selected doorway in the list of linked doorways for this space
  if (!selectedSpace.doorways.find(s => s.id === doorway_id)) {
    dispatch(spacesError(`Doorway with id ${doorway_id} not found`));
    return;
  }

  // Load first page of raw events
  dispatch(spacesPageActions.setRawEvents({page: 1}));
}
