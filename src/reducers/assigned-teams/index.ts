import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_ASSIGNED_TEAMS_SET } from '../../actions/collection/assigned-teams/set';
import { COLLECTION_ASSIGNED_TEAMS_ERROR } from '../../actions/collection/assigned-teams/error';

import { DensityAssignedTeam } from '../../types';

const initialState = {
  view: 'LOADING',
  error: null,
  data: [],
};

export default function assignedTeams(state=initialState, action) {
  switch (action.type) {

  // Update the whole assigned teams collection.
  case COLLECTION_ASSIGNED_TEAMS_SET:
    return {
      ...state,
      view: 'VISIBLE',
      error: null,
      data: action.data.map(t => objectSnakeToCamel<DensityAssignedTeam>(t)),
    };

  // An error occurred while loading assigned teams.
  case COLLECTION_ASSIGNED_TEAMS_ERROR:
    return {...state, view: 'ERROR', error: action.error};

  default:
    return state;
  }
}
