import objectSnakeToCamel from '../../helpers/object-snake-to-camel/index';
import { COLLECTION_SPACES_SET } from '../../actions/collection/spaces/set';
import { COLLECTION_SPACES_PUSH } from '../../actions/collection/spaces/push';
import { COLLECTION_SPACES_FILTER } from '../../actions/collection/spaces/filter';
import { COLLECTION_SPACES_CREATE } from '../../actions/collection/spaces/create';
import { COLLECTION_SPACES_DESTROY } from '../../actions/collection/spaces/destroy';
import { COLLECTION_SPACES_UPDATE } from '../../actions/collection/spaces/update';
import { COLLECTION_SPACES_DELETE } from '../../actions/collection/spaces/delete';
import { COLLECTION_SPACES_ERROR } from '../../actions/collection/spaces/error';
import { COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE } from '../../actions/collection/spaces/set-default-time-range'

import { COLLECTION_SPACES_COUNT_CHANGE } from '../../actions/collection/spaces/count-change';
import {
  COLLECTION_SPACES_SET_EVENTS,
  COLLECTION_SPACES_BATCH_SET_EVENTS,
} from '../../actions/collection/spaces/set-events';


import { ROUTE_TRANSITION_LIVE_SPACE_LIST } from '../../actions/route-transition/live-space-list';
import { ROUTE_TRANSITION_LIVE_SPACE_DETAIL } from '../../actions/route-transition/live-space-detail';
import { ROUTE_TRANSITION_EXPLORE } from '../../actions/route-transition/explore';
// import { ROUTE_TRANSITION_EXPLORE_CHANGE_SPACE } from '../../actions/route-transition/explore-change-space';
import { ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS } from '../../actions/route-transition/explore-space-trends';
import { ROUTE_TRANSITION_EXPLORE_SPACE_DAILY } from '../../actions/route-transition/explore-space-daily';
import { ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT } from '../../actions/route-transition/explore-space-data-export';
import { SORT_A_Z } from '../../helpers/sort-collection/index';
import { SHOW_MODAL } from '../../actions/modal/show';
import { HIDE_MODAL } from '../../actions/modal/hide';

import { DEFAULT_TIME_SEGMENT_GROUP } from '../../helpers/time-segments/index';

import {
  getCurrentLocalTimeAtSpace,
  formatInISOTime,
} from '../../helpers/space-time-utilities/index';

import moment from 'moment';

// Store at maximum 500 events per space
const EVENT_QUEUE_LENGTH = 500;

// How long should data be fetched when running utilization calculations?
const DATA_DURATION_WEEK = 'DATA_DURATION_WEEK';
      // DATA_DURATION_MONTH = 'DATA_DURATION_MONTH';

const initialState = {
  data: [],
  loading: true,
  error: null,
  selected: null,
  filters: {
    doorwayId: null,
    search: '',
    sort: SORT_A_Z,
    parent: null,

    timeSegmentGroupId: DEFAULT_TIME_SEGMENT_GROUP.id,
    dataDuration: DATA_DURATION_WEEK,

    metricToDisplay: 'entrances',
    dailyRawEventsPage: 1,

    // Used for date ranges
    startDate: null,
    endDate: null,

    // Used for a single date
    date: moment.utc().format(),
  },

  // An object that maps space id to an array of events
  events: {
    /* For example:
    'spc_XXXX': [{timestamp: '2017-07-24T12:37:42.946Z', direction: 1}],
    */
  },
};

function getTimeSegmentGroupIdForRouteChange(currentSelectedSpace, currentTimeSegmentGroupId) {
  let timeSegmentGroupId = currentTimeSegmentGroupId;
  if (!currentSelectedSpace) {
    timeSegmentGroupId = DEFAULT_TIME_SEGMENT_GROUP.id;
  } else if (!(currentSelectedSpace.timeSegmentGroups.map(ts => ts.id).includes(currentTimeSegmentGroupId))) {
    timeSegmentGroupId = DEFAULT_TIME_SEGMENT_GROUP.id;
  } else if (currentTimeSegmentGroupId == null) {
    timeSegmentGroupId = DEFAULT_TIME_SEGMENT_GROUP.id;
  }
  return timeSegmentGroupId;
}

export default function spaces(state=initialState, action) {
  switch (action.type) {

  // Update the whole space collection.
  case COLLECTION_SPACES_SET:
    return {
      ...state,
      loading: false,
      data: action.data.map(objectSnakeToCamel),
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
      loading: false,
      data: [
        // Update existing items
        ...state.data.map((item: any) => {
          if (action.item.id === item.id) {
            return {...item, ...objectSnakeToCamel(action.item)};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.data.find((i: any) => i.id === action.item.id) === undefined ?
            [objectSnakeToCamel(action.item)] :
            []
        ),
      ],
    };

  // An async operation is starting.
  case COLLECTION_SPACES_CREATE:
  case COLLECTION_SPACES_DESTROY:
  case COLLECTION_SPACES_UPDATE:
    return {...state, error: null, loading: true};

  // When an error happens in the collection, define an error.
  case COLLECTION_SPACES_ERROR:
    return {...state, error: action.error, loading: false};

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
    var currentSelectedSpace: any = state.data.find((space: any) => space.id === action.id);
    var timeSegmentGroupId: any = state.filters.timeSegmentGroupId;
    var newTimeSegmentGroupId: any = getTimeSegmentGroupIdForRouteChange(currentSelectedSpace, timeSegmentGroupId);

    return {
      ...state, 
      error: null, 
      selected: currentSelectedSpace.id,
      filters: {
        ...state.filters,
        timeSegmentGroupId: newTimeSegmentGroupId
      }
    };
  case ROUTE_TRANSITION_EXPLORE:
    var currentSelectedSpace: any = state.data.find((space: any) => space.id === action.id);
    var timeSegmentGroupId: any = state.filters.timeSegmentGroupId;
    var newTimeSegmentGroupId: any = getTimeSegmentGroupIdForRouteChange(currentSelectedSpace, timeSegmentGroupId);

    return {
      ...state, 
      error: null, 
      selected: null,
      filters: {
        ...state.filters,
        timeSegmentGroupId: newTimeSegmentGroupId
      }
    };
  case ROUTE_TRANSITION_EXPLORE_SPACE_TRENDS:
  case ROUTE_TRANSITION_EXPLORE_SPACE_DAILY:
  case ROUTE_TRANSITION_EXPLORE_SPACE_DATA_EXPORT:
    var currentSelectedSpace: any = state.data.find((space: any) => space.id === action.id);
    var timeSegmentGroupId: any = state.filters.timeSegmentGroupId;
    var newTimeSegmentGroupId: any = getTimeSegmentGroupIdForRouteChange(currentSelectedSpace, timeSegmentGroupId);
    
    return {
      ...state, 
      error: null, 
      selected: action.id,
      filters: {
        ...state.filters,
        timeSegmentGroupId: newTimeSegmentGroupId
      }
    };
  case ROUTE_TRANSITION_LIVE_SPACE_LIST:
    return {...state, error: null};

  case COLLECTION_SPACES_SET_DEFAULT_TIME_RANGE:
    if (state.filters.date != null && state.filters.startDate != null && state.filters.endDate != null) {
      return state
    } else {
      return {
        ...state,
        filters: {
          ...state.filters,

          // For single date pages like the daily page, default to today
          date: formatInISOTime(
            getCurrentLocalTimeAtSpace(action.space).startOf('day')
          ),

          // For date range pages like the trends or raw events page, default to the last full week of
          // data
          startDate: formatInISOTime(
            getCurrentLocalTimeAtSpace(action.space).subtract(1, 'week').startOf('week')
          ),
          endDate: formatInISOTime(
            getCurrentLocalTimeAtSpace(action.space).subtract(1, 'week').endOf('week')
          ),
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
