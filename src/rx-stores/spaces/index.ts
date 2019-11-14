import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_SPACES_SET } from '../../rx-actions/collection/spaces/set';
import { COLLECTION_SPACES_PUSH } from '../../rx-actions/collection/spaces/push';
import { COLLECTION_SPACES_FILTER } from '../../rx-actions/collection/spaces/filter';
import { COLLECTION_SPACES_CREATE } from '../../rx-actions/collection/spaces/create';
import { COLLECTION_SPACES_DESTROY } from '../../rx-actions/collection/spaces/destroy';
import { COLLECTION_SPACES_UPDATE } from '../../rx-actions/collection/spaces/update';
import { COLLECTION_SPACES_DELETE } from '../../rx-actions/collection/spaces/delete';
import { COLLECTION_SPACES_ERROR } from '../../rx-actions/collection/spaces/error';
import { COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE } from '../../rx-actions/collection/spaces/set-default-time-range'

import { COLLECTION_SPACES_COUNT_CHANGE } from '../../rx-actions/collection/spaces/count-change';
import {
  COLLECTION_SPACES_SET_EVENTS,
  COLLECTION_SPACES_BATCH_SET_EVENTS,
} from '../../rx-actions/collection/spaces/set-events';


import { ROUTE_TRANSITION_LIVE_SPACE_LIST } from '../../rx-actions/route-transition/live-space-list';
import { ROUTE_TRANSITION_LIVE_SPACE_DETAIL } from '../../rx-actions/route-transition/live-space-detail';
import { ROUTE_TRANSITION_EXPLORE } from '../../rx-actions/route-transition/explore';
import { ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS } from '../../rx-actions/route-transition/explore-space-trends';
import { ROUTE_TRANSITION_EXPLORE_SPACE_DAILY } from '../../rx-actions/route-transition/explore-space-daily';
import { ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT } from '../../rx-actions/route-transition/explore-space-data-export';
import { ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS } from '../../rx-actions/route-transition/explore-space-meetings';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS } from '../../rx-actions/route-transition/admin-locations';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW } from '../../rx-actions/route-transition/admin-locations-new';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT } from '../../rx-actions/route-transition/admin-locations-edit';
import { SORT_A_Z } from '../../helpers/sort-collection/index';
import { SHOW_MODAL } from '../../rx-actions/modal/show';
import { HIDE_MODAL } from '../../rx-actions/modal/hide';

import { DEFAULT_TIME_SEGMENT_LABEL } from '../../helpers/time-segments/index';

import { DensitySpace } from '../../types';
import createRxStore from '..';

// Store at maximum 500 events per space
const EVENT_QUEUE_LENGTH = 500;

// How long should data be fetched when running utilization calculations?
const DATA_DURATION_WEEK = 'DATA_DURATION_WEEK';
      // DATA_DURATION_MONTH = 'DATA_DURATION_MONTH';


export type SpacesState = {
  view: 'LOADING' | 'VISIBLE' | 'ERROR',
  data: DensitySpace[],
  loading: boolean,
  error: unknown,
  selected: DensitySpace['id'] | null,
  filters: {
    doorwayId: Any<FixInRefactor>,
    search: string,
    sort: Any<FixInRefactor>,
    parent: Any<FixInRefactor>,
    timeSegmentLabel: Any<FixInRefactor>,
    dataDuration: Any<FixInRefactor>,
    metricToDisplay: Any<FixInRefactor>,
    dailyRawEventsPage: number,

    startDate: Any<FixInRefactor>,
    endDate: Any<FixInRefactor>,
    date: Any<FixInRefactor>,
  },
  events: {
    [spaceId: string]: Any<FixInRefactor>[]
  }
}

const initialState: SpacesState = {
  view: 'LOADING',
  data: [],
  loading: true,
  error: null,
  selected: null,
  filters: {
    doorwayId: null,
    search: '',
    sort: SORT_A_Z,
    parent: null,

    timeSegmentLabel: DEFAULT_TIME_SEGMENT_LABEL,
    dataDuration: DATA_DURATION_WEEK,

    metricToDisplay: 'entrances',
    dailyRawEventsPage: 1,

    // Used for date ranges
    startDate: null,
    endDate: null,

    // Used for a single date
    date: null,
  },

  // An object that maps space id to an array of events
  events: {
    /* For example:
    'spc_XXXX': [{timestamp: '2017-07-24T12:37:42.946Z', direction: 1}],
    */
  },
};

function getTimeSegmentLabelForRouteChange(currentSelectedSpace, currentTimeSegmentLabel) {
  let timeSegmentLabel = currentTimeSegmentLabel;
  if (!currentSelectedSpace) {
    timeSegmentLabel = DEFAULT_TIME_SEGMENT_LABEL;
  } else if (!(currentSelectedSpace.timeSegments.map(ts => ts.label).includes(currentTimeSegmentLabel))) {
    timeSegmentLabel = DEFAULT_TIME_SEGMENT_LABEL;
  } else if (currentTimeSegmentLabel == null) {
    timeSegmentLabel = DEFAULT_TIME_SEGMENT_LABEL;
  }
  return timeSegmentLabel;
}

// FIXME: action should be GlobalAction
export function spacesReducer(state: SpacesState, action: Any<FixInRefactor>): SpacesState {
  var currentSelectedSpace: any,
      timeSegmentLabel: any,
      newTimeSegmentLabel: any;

  switch (action.type) {

  // Update the whole space collection.
  case COLLECTION_SPACES_SET:
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      data: action.data.map(s => objectSnakeToCamel<DensitySpace>(s)),
      filters: {
        ...state.filters,
        // If the parent space no longer exists with the space updates, then reset it to null
        parent: action.data.find(i => i.id === state.filters.parent) ? state.filters.parent : null,
      },
    };

  // Push an update to a space.
  case COLLECTION_SPACES_PUSH:
    return {
      ...state,
      view: 'VISIBLE',
      loading: false,
      data: [
        // Update existing items
        ...state.data.map((item: any) => {
          if (action.item.id === item.id) {
            return {...item, ...objectSnakeToCamel<DensitySpace>(action.item)};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.data.find((i: any) => i.id === action.item.id) === undefined ?
            [objectSnakeToCamel<DensitySpace>(action.item)] :
            []
        ),
      ],
    };

  // An async operation is starting.
  case COLLECTION_SPACES_CREATE:
  case COLLECTION_SPACES_DESTROY:
  case COLLECTION_SPACES_UPDATE:
    return {...state, error: null, loading: true, view: 'LOADING'};

  // When an error happens in the collection, define an error.
  case COLLECTION_SPACES_ERROR:
    return {...state, error: action.error, loading: false, view: 'ERROR'};

  // Add a filter to a space
  case COLLECTION_SPACES_FILTER:
    return {
      ...state,
      filters: {
        ...state.filters,
        [action.filter]: action.value,
      },
    };

  // Delete a space from the collection.
  case COLLECTION_SPACES_DELETE:
    return {
      ...state,
      loading: false,
      data: state.data.filter((item: any) => action.item.id !== item.id),
    };

  // When the user changes the active space, update it in the store.
  case ROUTE_TRANSITION_LIVE_SPACE_DETAIL:
    currentSelectedSpace = state.data.find((space: any) => space.id === action.id);
    timeSegmentLabel = state.filters.timeSegmentLabel;
    newTimeSegmentLabel = getTimeSegmentLabelForRouteChange(currentSelectedSpace, timeSegmentLabel);

    return {
      ...state, 
      error: null, 
      selected: currentSelectedSpace.id,
      filters: {
        ...state.filters,
        timeSegmentLabel: newTimeSegmentLabel
      }
    };
  case ROUTE_TRANSITION_EXPLORE:
    currentSelectedSpace = state.data.find((space: any) => space.id === action.id);
    timeSegmentLabel = state.filters.timeSegmentLabel;
    newTimeSegmentLabel = getTimeSegmentLabelForRouteChange(currentSelectedSpace, timeSegmentLabel);

    return {
      ...state, 
      error: null, 
      selected: null,
      filters: {
        ...state.filters,
        timeSegmentLabel: newTimeSegmentLabel
      }
    };
  case ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS:
  case ROUTE_TRANSITION_EXPLORE_SPACE_DAILY:
  case ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT:
  case ROUTE_TRANSITION_EXPLORE_SPACE_MEETINGS:
    currentSelectedSpace = state.data.find((space: any) => space.id === action.id);
    timeSegmentLabel = state.filters.timeSegmentLabel;
    newTimeSegmentLabel = getTimeSegmentLabelForRouteChange(currentSelectedSpace, timeSegmentLabel);

    return {
      ...state, 
      error: null, 
      selected: action.id,
      filters: {
        ...state.filters,
        timeSegmentLabel: newTimeSegmentLabel
      }
    };
  case ROUTE_TRANSITION_LIVE_SPACE_LIST:
    return {...state, error: null};
  case ROUTE_TRANSITION_ADMIN_LOCATIONS:
    return {
      ...state,
      view: action.setLoading ? 'LOADING' : state.view,
      loading: action.setLoading || state.loading,
      selected: action.parentSpaceId,
    };
  case ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW:
  case ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT:
    return {
      ...state,
      view: action.setLoading ? 'LOADING' : 'VISIBLE',
      loading: action.setLoading,
      selected: action.spaceId,
      data: [],
    };

  case COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE:
    if (state.selected && state.filters.date && state.filters.startDate && state.filters.endDate) {
      return state;
    } else {
      return {
        ...state,
        filters: {
          ...state.filters,

          // For single date pages like the daily page, default to today
          date: moment().startOf('day').format('YYYY-MM-DD'),

          // For date range pages like the trends or raw events page, default to the last full week of
          // data
          startDate: moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD'),
          endDate: moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD'),
        },
      };
    }

  // Also, when a modal is shown or hidden, clear the error from the state.
  case SHOW_MODAL:
  case HIDE_MODAL:
    return {...state, error: null};

// ----------------------------------------------------------------------------
// EVENTS COLLECTION
// Store and append to seperate events collections. Each is associated with a space.
// ------------------------------------------------------------------------------

  // Map an initial set of events into a space.
  case COLLECTION_SPACES_SET_EVENTS:
    return {
      ...state,
      events: {
        ...state.events,
        [action.item.id]: action.events,
      },
    };

  // Map an initial set of events into a batch of spaces.
  case COLLECTION_SPACES_BATCH_SET_EVENTS:
    return {
      ...state,
      events: action.events,
    };

  // The count on a given space changed. Update the count in the space and add events into the
  // events set.
  case COLLECTION_SPACES_COUNT_CHANGE:
    return {
      ...state,
      data: [
        // Update existing items
        ...state.data.map((item: any) => {
          if (action.id === item.id) {
            return {...item, currentCount: Math.max(item.currentCount + action.countChange, 0)};
          } else {
            return item;
          }
        }),
      ],

      // Add a new event to the events collection
      events: {
        ...state.events,
        [action.id]: [...(state.events[action.id] || []), {
          timestamp: action.timestamp,
          countChange: action.countChange,
        }].slice(-1 * EVENT_QUEUE_LENGTH),
      },
    };

  default:
    return state;
  }
}

const SpacesStore = createRxStore('SpacesStore', initialState, spacesReducer);
export default SpacesStore;
