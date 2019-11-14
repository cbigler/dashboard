import {
  AnalyticsDatapoint,
  AnalyticsReport,
  ResourceComplete,
  QueryResult,
} from '../../types/analytics';


// helper type to assert the loaded state of a report
export type AnalyticsReportLoaded = AnalyticsReport & {
  queryResult: ResourceComplete<QueryResult>
}

export type Bucket = {
  start: number,
  end: number,
  middle: number,
  datapoints: AnalyticsDatapoint[],
}

export type HoverStateValid = {
  isHovered: true,
  x: {
    value: number,
    position: number,
  },
  y: {
    value: number,
    position: number,
  },
  bucket: Bucket,
  exactMatchingDatapoints: AnalyticsDatapoint[]
}
export type HoverStateInvalid = {
  isHovered: false
}
export type HoverState = HoverStateValid | HoverStateInvalid;
