import { DayOfWeek } from './datetime';
import { CoreUser } from '@density/lib-api-types/core-v2/users';

export type DensityReport = {
  id: string,
  name: string,
  type: string,
  settings: any,
  creator_email?: string,
  dashboard_count?: number,
};

export type DensityDashboard = {
  id: string,
  name: string,
  creator_email: string,
  report_set: Array<DensityReport>,
};

export type DensityDigestSchedule = {
  id: string,
  name: string,
  creator: {
    id: string,
    name: string,
    email: string,
  },
  dashboard_id: string,
  frequency: 'WEEKLY' | 'MONTHLY',
  days_of_week: Array<DayOfWeek>,
  day_number: number,
  time: string,
  time_zone: string,
  recipients: Array<string>,
};

export type DensityNotification = {
  id?: string,
  space_id: string,
  enabled: boolean,
  notification_type: 'sms' | 'push_notification',
  trigger_type: 'greater_than' | 'less_than' | 'equal_to',
  trigger_value: number,
  is_one_shot: boolean,
  cooldown: number,
  meta?: {
    to_num?: string,
    escalation_delta?: number,
    escalation_sent_at?: number
  }
};

export type DensityReset = {
  id: string,
  space_id: string,
  timestamp: string,
  count: number,
};

export type DensitySocketPush = {
  version: string,
  payload: any,
};

export type DensityTag = {
  name: string,
};

export type DensityAssignedTeam = {
  name: string,
};

// Counts
export type DensitySpaceCountBucket = {
  count: number,
  timestamp: string,
  interval: DensitySpaceCountBucketInterval,
};

export type DensitySpaceCountBucketInterval = {
  start: string,
  end: string,
  analytics: DensitySpaceCountBucketIntervalAnalytics,
};

export type DensitySpaceCountBucketIntervalAnalytics = {
  events: number,
  min: number,
  max: number,
  entrances: number,
  exits: number,
  utilization: number,
  target_utilization: number,
};

export type DensitySpaceCountMetrics = {
  count: {
    average: number,
    max: {
      value: number,
      timestamp: string,
    },
    min: {
      value: number,
      timestamp: string,
    },
  },
  entrances: {
    average: number,
    peak: {
      value: number,
      timestamp: string,
    },
    total: number,
  },
  exits: {
    average: number,
    peak: {
      value: number,
      timestamp: string,
    },
    total: number,
  },
  target_utilization: {
    average: number,
    durations: {
      0: string,
      40: string,
      80: string,
      100: string,
    },
    max: {
      value: number,
      timestamp: string,
    },
    min: {
      value: number,
      timestamp: string,
    },
  },
};

export type DensityDoorwayMapping = {
  id: string,
  service_id: string,
  doorway_id: string,
  service_doorway_id: string,
}

// Data structure returned by the Brivo API (access points response is optionally nested in sites response)
export type BrivoAccessPoint = {
  id: number,
  name: string,
  controlPanelId: number,
  siteId: number,
  siteName: string,
  activationEnabled: boolean,
}

// For this API type, everything is camel case except for "event_subscription_id", this is not a mistake
export type DensityBrivoSite = {
  id: number,
  siteName: string,
  accessPoints: Array<BrivoAccessPoint>,
  event_subscription_id: string | null,
}

// Service
export type DensityService = {
  id: string,
  name: string,
  display_name: string,
  category: string,
  service_authorization: DensityServiceAuthorization,
};

// ServiceAuthorization
export type DensityServiceAuthorization = (
  | {
    id: string,
    last_sync: string | null,
    default: boolean,
    user: CoreUser,
    credentials?: { [key: string]: string },
  }
  | { id: undefined, last_sync: null, default: false }
);

export type DensitySpaceMapping = {
  id: string,
  service_id: string,
  space_id: string,
  service_space_id: string,
};

export type DensityReportOptions = {
  date?: string; // A moment representing "now", in utc. This permits reports to be run for any time period, including in the past!
  week_start?: string; // A weekday for the report week to start on. Default is "Sunday".
  client: any; // An axios client used to make AJAX requests.
  slow: boolean; // A flag representing if the report calculations should run specifying the "?slow=true" flag, which bypasses the new reporting database.
}
export type DensityReportCalculationFunction = (report: DensityReport, opts: DensityReportOptions) => Promise<object>;

export type DensityServiceSpace = {
  service: string,
  service_space_id: string,
  name: string,
  space_type: string,
  parent: string,
};
