import { EXPLORE_DATA_ADD_CALCULATION } from '../../rx-actions/explore-data/add-calculation';
import { EXPLORE_DATA_CALCULATE_DATA_LOADING } from '../../rx-actions/explore-data/calculate-data-loading';
import { EXPLORE_DATA_CALCULATE_DATA_COMPLETE } from '../../rx-actions/explore-data/calculate-data-complete';
import { EXPLORE_DATA_CALCULATE_DATA_ERROR } from '../../rx-actions/explore-data/calculate-data-error';
import createRxStore from '..';


type ExploreDataModuleState = {
  state: 'EMPTY' | 'LOADING' | 'COMPLETE' | 'ERROR',
  data: Any<FixInRefactor>,
  error: unknown,
}

type ExploreDataState = {
  calculations: {
    hourlyBreakdownVisits: ExploreDataModuleState,
    hourlyBreakdownPeaks: ExploreDataModuleState,
    spaceList: ExploreDataModuleState,
    dailyMetrics: ExploreDataModuleState,
    utilization: ExploreDataModuleState,
    dailyRawEvents: ExploreDataModuleState,
    footTraffic: ExploreDataModuleState,
  }
}

const initialModuleState: ExploreDataModuleState = {
  state: 'EMPTY',
  data: null,
  error: null,
};

export const initialState: ExploreDataState = {
  calculations: {
    footTraffic: {
      ...initialModuleState,
    },
    hourlyBreakdownVisits: {
      ...initialModuleState,
    },
    hourlyBreakdownPeaks: {
      ...initialModuleState,
    },
    spaceList: {
      ...initialModuleState,
      data: {
        spaceCounts: {},
        spaceUtilizations: {},
      },
    },
    dailyMetrics: { ...initialModuleState },
    utilization: {
      ...initialModuleState,
      data: {
        requiresCapacity: false,
        counts: [],
      },
    },
    dailyRawEvents: {
      ...initialModuleState,
      data: {},
    },
  },
};

export function exploreDataReducer(state: ExploreDataState, action: Any<FixInRefactor>): ExploreDataState {
  switch (action.type) {
  case EXPLORE_DATA_ADD_CALCULATION:
    if (!state.calculations[action.calculation]) {
      return {
        ...state,
        calculations: {
          ...state.calculations,
          [action.calculation]: {...initialModuleState},
        },
      };
    } else {
      return state;
    }

  case EXPLORE_DATA_CALCULATE_DATA_LOADING:
    return {
      ...state,
      calculations: {
        ...state.calculations,
        [action.calculation]: { ...state.calculations[action.calculation], state: 'LOADING' },
      },
    };

  case EXPLORE_DATA_CALCULATE_DATA_COMPLETE:
    return {
      ...state,
      calculations: {
        ...state.calculations,
        [action.calculation]: {
          ...state.calculations[action.calculation],
          data: action.data,
          state: 'COMPLETE',
        },
      },
    };

  case EXPLORE_DATA_CALCULATE_DATA_ERROR:
    return {
      ...state,
      calculations: {
        ...state.calculations,
        [action.calculation]: {
          ...state.calculations[action.calculation],
          state: 'ERROR',
          error: action.error,
        },
      },
    };

  default:
    return state;
  }
}

const ExploreDataStore = createRxStore('ExploreDataStore', initialState, exploreDataReducer);
export default ExploreDataStore;
