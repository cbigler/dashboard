import { CoreSpaceCountBucket } from '@density/lib-api-types/core-v2/counts';
import { CoreWebsocketEventPayload, CoreSpaceEvent } from '@density/lib-api-types/core-v2/events';
import { TimeFilter } from '../../types/datetime';
import { SpacesPageState } from '../../rx-stores/spaces-page/reducer';
import { ActionTypesOf } from '..';
import { DensityDoorwayMapping } from '../../types';

// Controls
const clearData = () => ({ type: 'SPACES_PAGE_CLEAR_DATA' as const });
const setNavigationCollapsed = (value: boolean) => ({ type: 'SPACES_PAGE_SET_NAVIGATION_COLLAPSED' as const, value });
const setShowDoorways = (value: boolean) => ({ type: 'SPACES_PAGE_SET_SHOW_DOORWAYS' as const, value });
const setCollapsedSpaces = (value: Set<string>) => ({ type: 'SPACES_PAGE_SET_COLLAPSED_SPACES' as const, value });
const setTimeSegmentLabel = (value: string) => ({ type: 'SPACES_PAGE_SET_TIME_SEGMENT_LABEL' as const, value });
const setTimeFilter = (value: TimeFilter) => ({ type: 'SPACES_PAGE_SET_TIME_FILTER' as const, value });
const setReportDates = (startDate: string, endDate: string) => ({ type: 'SPACES_PAGE_SET_REPORT_DATES' as const, startDate, endDate });
const setDailyDate = (value: string, indicateLoading: boolean) => ({ type: 'SPACES_PAGE_SET_DAILY_DATE' as const, value, indicateLoading });
const setSelectedSpace = (spaceId: string) => ({ type: 'SPACES_PAGE_SET_SELECTED_SPACE' as const, spaceId });
const setSelectedDoorway = (spaceId: string, doorwayId: string) => ({ type: 'SPACES_PAGE_SET_SELECTED_DOORWAY' as const, spaceId, doorwayId });

// Page data
const setDoorwayMappings = (data: Array<DensityDoorwayMapping>) => ({ type: 'SPACES_PAGE_SET_DOORWAY_MAPPINGS' as const, data })
const setAllLiveEvents = (data: Array<CoreSpaceEvent>) => ({ type: 'SPACES_PAGE_SET_ALL_LIVE_EVENTS' as const, data });
const setOneLiveEvent = (data: CoreWebsocketEventPayload) => ({ type: 'SPACES_PAGE_SET_ONE_LIVE_EVENT' as const, data });
const setLiveStats = (occupancy: number, entrances: number, exits: number) => ({
  type: 'SPACES_PAGE_SET_LIVE_STATS' as const,
  occupancy,
  entrances,
  exits,
});
const setDailyOccupancy = (buckets: Array<CoreSpaceCountBucket>) => ({
  type: 'SPACES_PAGE_SET_DAILY_OCCUPANCY' as const,
  buckets,
});
const setDailyOccupancyPeak = (peak: number) => ({
  type: 'SPACES_PAGE_SET_DAILY_OCCUPANCY_PEAK' as const,
  peak,
});
const setRawEvents = (rawEvents: Partial<SpacesPageState['rawEvents']>) => ({
  type: 'SPACES_PAGE_SET_RAW_EVENTS' as const,
  rawEvents,
});

export const spacesPageActions = {
  clearData,
  setNavigationCollapsed,
  setShowDoorways,
  setCollapsedSpaces,
  setTimeSegmentLabel,
  setTimeFilter,
  setReportDates,
  setDailyDate,
  setSelectedSpace,
  setSelectedDoorway,
  setDoorwayMappings,
  setAllLiveEvents,
  setOneLiveEvent,
  setLiveStats,
  setDailyOccupancy,
  setDailyOccupancyPeak,
  setRawEvents,
};
export type SpacesPageAction = ActionTypesOf<typeof spacesPageActions>;
