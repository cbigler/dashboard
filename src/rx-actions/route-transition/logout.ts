import sessionTokenUnset from '../session-token/unset';
import collectionSpacesSet from '../collection/spaces/set';
import collectionSpaceHierarchySet from '../collection/space-hierarchy/set';
import collectionTokensSet from '../collection/tokens/set';
import collectionWebhooksSet from '../collection/webhooks/set';
import collectionServicesSet from '../collection/services/set';
import { UserActionTypes } from '../../types/users';

export const ROUTE_TRANSITION_LOGOUT = 'ROUTE_TRANSITION_LOGOUT';

export default function routeTransitionLogout(dispatch) {
  dispatch({ type: ROUTE_TRANSITION_LOGOUT });
  dispatch(sessionTokenUnset());
  dispatch(collectionSpacesSet([]));
  dispatch(collectionSpaceHierarchySet([]));
  dispatch(collectionTokensSet([]));
  dispatch(collectionWebhooksSet([]));
  dispatch(collectionServicesSet([]));
  dispatch({ type: UserActionTypes.USER_MANAGEMENT_USERS_SET, users: [] });
  window.location.hash = '#/login';
}
