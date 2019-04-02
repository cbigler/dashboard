import sessionTokenUnset from '../session-token/unset';
import collectionSpacesSet from '../collection/spaces/set';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionDoorwaysSet from '../collection/doorways/set';
import collectionLinksSet from '../collection/links/set';
import collectionUsersSet from '../collection/users/set';
import collectionTokensSet from '../collection/tokens/set';
import collectionWebhooksSet from '../collection/webhooks/set';
import collectionTimeSegmentGroupsSet from '../collection/time-segment-groups/set';
import collectionServicesSet from '../collection/services/set';

export const ROUTE_TRANSITION_LOGOUT = 'ROUTE_TRANSITION_LOGOUT';

export default function routeTransitionLogout() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_LOGOUT });
    dispatch(sessionTokenUnset());
    dispatch(collectionSpacesSet([]));
    dispatch(collectionSpaceHierarchySet([]));
    dispatch(collectionDoorwaysSet([]));
    dispatch(collectionLinksSet([]));
    dispatch(collectionUsersSet([]));
    dispatch(collectionTokensSet([]));
    dispatch(collectionWebhooksSet([]));
    dispatch(collectionTimeSegmentGroupsSet([]));
    dispatch(collectionServicesSet([]));
    window.location.hash = '#/login';
  };
}
