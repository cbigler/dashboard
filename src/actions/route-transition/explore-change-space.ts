import moment from 'moment';
import { core } from '../../client';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';

import fetchAllPages from '../../helpers/fetch-all-pages/index';

import collectionSpacesSet from '../collection/spaces/set';
import collectionSpacesError from '../collection/spaces/error';
import convertSpacesToSpaceTree from '../../helpers/convert-spaces-to-space-tree/index';

import { ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS } from '../../actions/route-transition/explore-space-trends';

export const ROUTE_TRANSITION_EXPLORE = 'ROUTE_TRANSITION_EXPLORE';


export default function routeTransitionExploreChangeSpace() {
  return async (dispatch, getState) => {
    dispatch({ type: ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS });
  }
}
