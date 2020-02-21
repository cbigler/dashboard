import { CoreSpaceCountBucket, CoreSpaceCountMetrics } from '@density/lib-api-types/core-v2/counts';
import { CoreSpaceEvent } from '@density/lib-api-types/core-v2/events';
import { TimeOfDay } from '../../types/datetime';
import { GlobalAction } from '../../types/rx-actions';

import moment from 'moment-timezone';
import { DayToggles } from '../../components/analytics-control-bar-time-filter';
import { DEFAULT_TIME_SEGMENT_LABEL } from '../../helpers/time-segments';
import { DensityDoorwayMapping } from '../../types';

export type SpacesPageState = {
  navigationCollapsed: boolean,
  showDoorways: boolean,
  collapsedSpaces: Set<string>,
  searchFilter: string,
  timeSegmentLabel: string,
  timeFilter: {
    start: TimeOfDay,
    end: TimeOfDay,
    daysOfWeek: DayToggles,
    isOvernight: boolean
  },
  startDate: string,
  endDate: string,
  dailyDate: string,
  spaceId: string | null,
  doorwayId: string | null,
  doorwayMappings: ReadonlyMap<string, DensityDoorwayMapping>,
  liveEvents: {
    data: Array<{ timestamp: string, direction: number }>,
    metrics: { occupancy: number, entrances: number, exits: number },
    status: 'LOADING' | 'ERROR' | 'COMPLETE',
    error: Error | null,
  },
  dailyOccupancy: {
    buckets: Array<CoreSpaceCountBucket>,
    metrics: CoreSpaceCountMetrics | null,
    status: 'LOADING' | 'ERROR' | 'COMPLETE',
    error: Error | null,
  },
  rawEvents: {
    data: Array<CoreSpaceEvent>,
    page: number,
    totalEvents: number,
    status: 'LOADING' | 'ERROR' | 'COMPLETE',
    error: Error | null,
  },
};

export function getInitialState() {
  const now = moment();
  const saved = localStorage.sessionSpacesPageState ? JSON.parse(localStorage.sessionSpacesPageState) : {};
  if (saved.collapsedSpaces) { saved.collapsedSpaces = new Set(saved.collapsedSpaces); }

  return Object.assign({
    navigationCollapsed: false,
    showDoorways: true,
    collapsedSpaces: new Set(),
    searchFilter: '',
    timeSegmentLabel: DEFAULT_TIME_SEGMENT_LABEL,
    timeFilter: {
      start: { hour: 0, minute: 0, second: 0, millisecond: 0 },
      end: { hour: 24, minute: 0, second: 0, millisecond: 0 },
      daysOfWeek: {
        'Sunday': false,
        'Monday': true,
        'Tuesday': true,
        'Wednesday': true,
        'Thursday': true,
        'Friday': true,
        'Saturday': false
      },
      isOvernight: false,
    },
    startDate: now.clone().subtract(13, 'days').format('YYYY-MM-DD'),
    endDate: now.clone().format('YYYY-MM-DD'),
    dailyDate: '',
    spaceId: null,
    doorwayId: null,
    doorwayMappings: new Map(),
    liveEvents: {
      data: [],
      metrics: { occupancy: 0, entrances: 0, exits: 0 },
      status: 'LOADING',
      error: null,
    },
    dailyOccupancy: {
      buckets: [],
      metrics: null,
      status: 'LOADING',
      error: null,
    },
    rawEvents: {
      data: [],
      page: 1,
      totalEvents: 0,
      status: 'LOADING',
      error: null,
    },
  }, saved);
}

export function spacesPageReducer(state: SpacesPageState, action: GlobalAction): SpacesPageState {
  switch (action.type) {
    case 'SPACES_PAGE_CLEAR_DATA':
      const { searchFilter, timeFilter, startDate, endDate, dailyDate } = state;
      return { ...getInitialState(), searchFilter, timeFilter, startDate, endDate, dailyDate };
    case 'SPACES_PAGE_SET_NAVIGATION_COLLAPSED':
      return { ...state, navigationCollapsed: action.value };
    case 'SPACES_PAGE_SET_SHOW_DOORWAYS':
      return { ...state, showDoorways: action.value };
    case 'SPACES_PAGE_SET_COLLAPSED_SPACES':
      return { ...state, collapsedSpaces: action.value };
    case 'SPACES_PAGE_SET_TIME_SEGMENT_LABEL':
      return { ...state, timeSegmentLabel: action.value };
    case 'SPACES_PAGE_SET_TIME_FILTER':
      return { ...state, timeFilter: { ...state.timeFilter, ...action.value } };
    case 'SPACES_PAGE_SET_REPORT_DATES':
      return {
        ...state,
        startDate: action.startDate,
        endDate: action.endDate,
        rawEvents: getInitialState().rawEvents,
      };
    case 'SPACES_PAGE_SET_DAILY_DATE':
      return { ...state, dailyDate: action.value, dailyOccupancy: { ...state.dailyOccupancy, status: 'LOADING' } };
    case 'SPACES_PAGE_SET_SELECTED_SPACE':
      return { ...state, spaceId: action.spaceId, doorwayId: null };
    case 'SPACES_PAGE_SET_SELECTED_DOORWAY':
      return { ...state, spaceId: action.spaceId, doorwayId: action.doorwayId };
    case 'SPACES_PAGE_SET_DOORWAY_MAPPINGS':
      return {
        ...state,
        // This map is currently only used to decide whether to prompt to set up a "new" mapping, or
        // "manage". In the future there could be many services with doorway mappings per doorway,
        // and there is no "default" service, so this map only contains the "last" service.
        doorwayMappings: action.data.reduce((acc, next) => acc.set(next.doorway_id, next), new Map()),
      };
    case 'SPACES_PAGE_SET_ALL_LIVE_EVENTS':
      return {
        ...state,
        liveEvents: {
          ...state.liveEvents,
          data: action.data,
          status: 'COMPLETE',
        }
      };
    case 'SPACES_PAGE_SET_ONE_LIVE_EVENT':
      return {
        ...state,
        liveEvents: {
          ...state.liveEvents,
          data: [
            ...state.liveEvents.data.filter(x => moment(x.timestamp) >= moment.utc().subtract(2, 'minutes')),
            action.data
          ]
        }
      };
    case 'SPACES_PAGE_SET_LIVE_STATS':
      const { type: foo1, ...liveStats } = action;
      return {
        ...state,
        liveEvents: {
          ...state.liveEvents,
          metrics: liveStats,
        }
      };
    case 'SPACES_PAGE_SET_DAILY_OCCUPANCY':
      const { type: foo2, ...dailyOccupancy } = action;
      return {
        ...state,
        dailyOccupancy: {
          ...state.dailyOccupancy,
          ...dailyOccupancy,
          status: 'COMPLETE',
        }
      };
    case 'SPACES_PAGE_SET_RAW_EVENTS':
      const { rawEvents } = action;
      return {
        ...state,
        rawEvents: {
          ...state.rawEvents,
          ...rawEvents,
          status: 'COMPLETE',
        }
      };
    default:
      return state;
  }
}
