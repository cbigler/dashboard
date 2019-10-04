import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';

import fetchAllObjects from '../../helpers/fetch-all-objects';

import { DensitySpace, DensitySpaceHierarchyItem } from '../../types';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionAlertsRead from '../alerts/read';
import spaceReportsCalculateReportData from '../space-reports/calculate-report-data';
import spacesUpdateReportController from '../space-reports/update-report-controller';
import SpaceReportsStore from '../../rx-stores/space-reports';


export const ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS = 'ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS';

export default async function routeTransitionExploreSpaceMeetings(dispatch, id: Any<FixInRefactor>, roomBookingServiceName: Any<FixInRefactor> = null) {
  SpaceReportsStore.imperativelyGetValue().controllers.forEach(controller => {
    dispatch(spacesUpdateReportController(null, {
      ...controller,
      status: 'LOADING'
    }));
  })

  // Change the active page
  dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS, id });

  // Ideally, we'd load a single space (since the view only pertains to one space). But, we need
  // every space to traverse through the space hierarchy and render a list of parent spaces on
  // this view unrfortunately.
  let spaces, spaceHierarchy, selectedSpace;
  try {
    spaceHierarchy = await fetchAllObjects<DensitySpaceHierarchyItem>('/spaces/hierarchy');
    spaces = await fetchAllObjects<DensitySpace>('/spaces');
  } catch (err) {
    dispatch(collectionSpacesError(`Error loading data: ${err.message}`));
    return;
  }

  selectedSpace = spaces.find(s => s.id === id);
  if (!selectedSpace) {
    dispatch(collectionSpacesError(`Space with id ${id} not found`));
    return;
  }

  await collectionAlertsRead(dispatch);

  dispatch(collectionSpacesSet(spaces));
  dispatch(collectionSpaceHierarchySet(spaceHierarchy));

  // Calculate all reports for all controllers
  return SpaceReportsStore.imperativelyGetValue().controllers.filter(x => x.key === 'meetings_page_controller').forEach(controller => {
    spaceReportsCalculateReportData(dispatch, controller, selectedSpace);
  });
}