import { EXPLORE_DATA_ADD_CALCULATION } from '../../actions/explore-data/add-calculation';
import { EXPLORE_DATA_CALCULATE_DATA_LOADING } from '../../actions/explore-data/calculate-data-loading';
import { EXPLORE_DATA_CALCULATE_DATA_COMPLETE } from '../../actions/explore-data/calculate-data-complete';
import { EXPLORE_DATA_CALCULATE_DATA_ERROR } from '../../actions/explore-data/calculate-data-error';
import {
  EXPLORE_DATA_ROBIN_SPACES_SET,
  EXPLORE_DATA_ROBIN_SPACES_ERROR,
  EXPLORE_DATA_ROBIN_SPACES_SELECT,
} from '../../actions/explore-data/robin';

const initialModuleState = {
  state: 'EMPTY',
  data: null,
  error: null,
};

const initialState = {
  calculations: {
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
    meetings: {
      ...initialModuleState,
    },
  },
  robinSpaces: {
    view: ('LOADING' as any),
    data: ([] as Array<any>),
    error: (null as any),
  },
};

export default function exploreData(state=initialState, action) {
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


  case EXPLORE_DATA_ROBIN_SPACES_SET:
    return {
      ...state,
      robinSpaces: {
        ...state.robinSpaces,
        view: 'COMPLETE',
        data: action.data,
        error: null,
      },
    };

  case EXPLORE_DATA_ROBIN_SPACES_ERROR:
    return {
      ...state,
      robinSpaces: {
        ...state.robinSpaces,
        view: 'ERROR',
        error: action.error,
      },
    };

  case EXPLORE_DATA_ROBIN_SPACES_SELECT:
    return {
      ...state,
      robinSpaces: {
        ...state.robinSpaces,
        selected: action.id,
      },
    };


  default:
    return state;
  }
}
