export type DaysOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export enum DensitySpaceTypes {
	SPACE = 'space',
	FLOOR = 'floor',
	BUILDING = 'building',
	CAMPUS = 'campus',
};

export type DensitySpace = {
  id: string,
  name: string,
  description: string,
  parentId: string,
  spaceType: DensitySpaceTypes,
  timeZone: string,
  dailyReset: string,
  currentCount: number,
  capacity: number,
  createdAt: string,
  ancestry: Array<DensitySpaceAncestryItem>,
  doorways: Array<{
    id: string,
    linkId: string,
    name: string,
    sensorPlacement: 1 | -1,
  }>,
  tags: Array<string>,
  addressLine1: string | null,
  addressLine2: string | null,
  city: string | null,
  stateProvince: string | null,
  postalCode: string | null,
  countryCode: string | null,
  latitude: number | null,
  longitude: number | null,
  timeSegments: Array<DensityTimeSegment>,
  timeSegmentGroups?: Array<{
    id: string,
    name: string,
  }>,
  sensorsTotal: number,
  inheritsTimeSegments: boolean,
};

export type DensitySpaceAncestryItem = {
  id: string;
  name: string;
};

export type DensityDoorway = {
  id: string,
  sensorSerialNumber: string,
  name: string,
  description: string,
  spaces: Array<{
    id: string,
    linkId: string,
    name: string,
    sensorPlacement: 1 | -1,
  }>,
  tags: Array<string>,
  environment?: {
    height: number,
    width: number,
    clearance: boolean,
    powerType: 'POWER_OVER_ETHERNET' | 'AC_OUTLET',
    insideImageUrl: string,
    outsideImageUrl: string,
  },
};

export type DensityLink = {
  id: string,
  spaceId: string,
  doorwayId: string,
  spaceName: string,
  doorwayName: string,
  sensorPlacement: 1 | -1,
};

export type DensityTimeSegment = {
  id: string,
  label: string,
  start: string,
  end: string,
  spaces: Array<{
    id: string,
    spaceName: string,
  }>,
  days: Array<string>,
};

export type DensityTimeSegmentLabel = string;

export type DensityTimeSegmentGroup = {
  id: string,
  name: string,
  timeSegments: Array<{
    timeSegmentId: string,
    name: string,
  }>,
};

export type DensitySensorType = "s5" | "r60" | "r56" | "virtual";
export type DensitySensor = {
	serialNumber: string,
  doorwayId: string,
  doorwayName: string,
  sensorType: DensitySensorType,
  status: string, // FIXME: should be enum?
  lastHeartbeat: string,
  currentDisposition: string,
  networkAddresses: Array<{
    if: string,
    family: string,
    address: string,
  }>,
};

export type DensityWebhook = {
  id: string,
  name: string,
  description: string,
  endpoint: string,
  version: string,
  headers: { [key: string]: string },
};

export type DensityReport = {
  id: string,
  name: string,
  type: string,
  settings: any,
  creatorEmail: string,
};

export type DensityDashboard = {
  id: string,
  name: string,
  creatorEmail: string,
  reportSet: Array<DensityReport>,
};

export type DensityDigestSchedule = {
  id: string,
  name: string,
  creator: {
    id: string,
    name: string,
    email: string,
  },
  dashboardId: string,
  frequency: "WEEKLY" | "MONTHLY",
  daysOfWeek: Array<DaysOfWeek>,
  dayNumber: number,
  time: string,
  timeZone: string,
  recipients: Array<string>,
};

export type DensityNotification = {
  id?: string,
  spaceId: string,
  enabled: boolean,
  notificationType: "sms" | "push_notification",
  triggerType: "greater_than" | "less_than" | "equal_to",
  triggerValue: number,
  isOneShot: boolean,
  cooldown: number,
  meta?: Object
};

export type DensityToken = {
  key: string,
  name: string,
  description: string,
  tokenType: "readonly" | "readwrite",
};

export type DensityReset = {
  id: string,
  spaceId: string,
  timestamp: string,
  count: number,
};

export type DensitySocketPush = {
  version: string,
  payload: any,
};

export type DensityOrganization = {
  id: string,
  name: string,
  forceSsoLogin: boolean,
  settings: { [key: string]: string },
};

export type DensityUser = {
  id: string,
  email: string,
  fullName: string | null,
  organization: DensityOrganization,
  isDemo: boolean,
  coreConsent: boolean,
  marketingConsent: boolean,
  role: string,
  lastLogin: string | null,
  invitationStatus: string,
  createdAt: string,
  permissions: Array<string>,
  spaces: Array<string>,
  sizeAreaDisplayUnit: 'square_feet' | 'square_meters',
};

export type DensityTag = {
  name: string,
};

export type DensityAssignedTeam = {
  name: string,
};

// Counts

// Service
export type DensityService = {
  name: string,
  displayName: string,
  category: string,
	serviceAuthorization: DensityServiceAuthorization,
};

// ServiceAuthorization
export type DensityServiceAuthorization = {
  id: string,
  credentials: { [key: string]: string },
  default: boolean,
  lastSync: string,
  user: DensityUser,
};

export type DensitySpaceMapping = {
  id: string,
  serviceId: string,
  spaceId: string,
  serviceSpaceId: string,
};

export type DensityReportOptions = {
  date: string; // A moment representing "now", in utc. This permits reports to be run for any time period, including in the past!
  weekStart: string; // A weekday for the report week to start on. Default is "Sunday".
  client: any; // An axios client used to make AJAX requests.
  slow: boolean; // A flag representing if the report calculations should run specifying the "?slow=true" flag, which bypasses the new reporting database.
}
export type DensityReportCalculatationFunction = (report: DensityReport, opts: DensityReportOptions) => Promise<object>;

export type DensityServiceSpace = {
    service: string,
    serviceSpaceId: string,
    name: string,
    spaceType: string,
    parent: string,
};
export type DensitySpaceHierarchyItem = {
  id: string,
  name: string,
  spaceType: string,
  hasPurview: boolean,
  timeSegments: Array<DensityTimeSegment>,
  inheritsTimeSegments: boolean,
  dailyReset: string,
  children?: Array<DensitySpaceHierarchyItem>,
};
