import { COLLECTION_ASSIGNED_TEAMS_SET } from '../../rx-actions/collection/assigned-teams/set';
import { COLLECTION_ASSIGNED_TEAMS_ERROR } from '../../rx-actions/collection/assigned-teams/error';

import { DensityAssignedTeam } from '../../types';
import createRxStore from '..';


export type AssignedTeamsState = {
  view: 'LOADING' | 'VISIBLE' | 'ERROR',
  error: unknown,
  data: DensityAssignedTeam[],
}

const initialState: AssignedTeamsState = {
  view: 'LOADING',
  error: null,
  data: [],
};

// FIXME: action should be GlobalAction
export function assignedTeamsReducer(state: AssignedTeamsState, action: Any<FixInRefactor>): AssignedTeamsState {
  switch (action.type) {

  // Update the whole assigned teams collection.
  case COLLECTION_ASSIGNED_TEAMS_SET:
    return {
      ...state,
      view: 'VISIBLE',
      error: null,
      data: action.data as Array<DensityAssignedTeam>,
    };

  // An error occurred while loading assigned teams.
  case COLLECTION_ASSIGNED_TEAMS_ERROR:
    return {...state, view: 'ERROR', error: action.error};

  default:
    return state;
  }
}

const AssignedTeamsStore = createRxStore('AssignedTeamsStore', initialState, assignedTeamsReducer);
export default AssignedTeamsStore;
