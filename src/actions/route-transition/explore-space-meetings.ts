import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';

import fetchAllObjects from '../../helpers/fetch-all-objects';

import { DensitySpace, DensitySpaceHierarchyItem } from '../../types';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionAlertsLoad from '../collection/alerts/load';
import spaceReportsCalculateReportData from '../space-reports/calculate-report-data';
import spacesUpdateReportController from '../space-reports/update-report-controller';


export const ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS = 'ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS';

export default function routeTransitionExploreSpaceMeetings(id, roomBookingServiceName = null) {
  return async (dispatch, getState) => {
    getState().spaceReports.controllers.forEach(controller => {
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

    await dispatch(collectionAlertsLoad());

    dispatch(collectionSpacesSet(spaces));
    dispatch(collectionSpaceHierarchySet(spaceHierarchy));

    // Calculate all reports for all controllers
    return getState().spaceReports.controllers.filter(x => x.key === 'meetings_page_controller').map(controller => {
      return dispatch(spaceReportsCalculateReportData(controller, selectedSpace));
    });
  }
}