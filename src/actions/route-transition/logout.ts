import sessionTokenUnset from '../session-token/unset';
import collectionSpacesSet from '../collection/spaces/set';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionDoorwaysSet from '../collection/doorways/set';
import collectionLinksSet from '../collection/links/set';

export const ROUTE_TRANSITION_LOGOUT = 'ROUTE_TRANSITION_LOGOUT';

export default function routeTransitionLogout() {
  return dispatch => {
    dispatch({ type: ROUTE_TRANSITION_LOGOUT });
    dispatch(sessionTokenUnset());
    dispatch(collectionSpacesSet([]));
    dispatch(collectionSpaceHierarchySet([]));
    dispatch(collectionDoorwaysSet([]));
    dispatch(collectionLinksSet([]));
    window.location.hash = '#/login';
  };
}
