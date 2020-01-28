import { ActionTypesOf } from '../space-management';
import {
  adminLocations,
  adminLocationsNew,
  adminLocationsEdit,
} from './temporary-simple-actions';


export const routeTransitionActions = {
  adminLocations,
  adminLocationsNew,
  adminLocationsEdit,
}

export type RouteTransitionAction = ActionTypesOf<typeof routeTransitionActions>;
