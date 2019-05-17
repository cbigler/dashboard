import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { SQUARE_FEET } from '../../helpers/convert-unit/index';
import { DensityUser, DensitySpace } from '../../types';

import { ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW } from '../../actions/route-transition/admin-locations-new';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT } from '../../actions/route-transition/admin-locations-edit';
import { USER_SET } from '../../actions/user/set';
import { USER_PUSH } from '../../actions/user/push';
import { SPACE_MANAGEMENT_UPDATE_FORM_STATE } from '../../actions/space-management/update-form-state';
import { SPACE_MANAGEMENT_SET_DATA } from '../../actions/space-management/set-data';
import { SPACE_MANAGEMENT_ERROR } from '../../actions/space-management/error';

const initialState = {
  view: 'LOADING_INITIAL',
  error: null,

  spaces: {
    data: [],
    selected: null,
  },
  spaceHierarchy: {},
  timeSegmentGroups: [],
  operatingHoursLabels: [],

  formParentSpaceId: null,
  formSpaceType: null,
  formState: {},
  userDataSizeAreaDisplayUnit: null,
};

export type OperatingHoursItem = {
  id: string,
  label: string | null,
  startTimeSeconds: number,
  endTimeSeconds: number,
  daysAffected: Array<string>,
  operationToPerform?: 'CREATE' | 'UPDATE' | 'DELETE' | null,
};
export type OperatingHoursLabelItem = {
  id: string,
  name: string,
};
export type AdminLocationsFormState = {
  name: string,
  spaceType: string,
  'function': string,
  annualRent: any,
  sizeArea: any,
  sizeAreaUnit: 'feet' | 'meters',
  currencyUnit: 'USD',
  capacity: string,
  targetCapacity: string,
  floorLevel: string,
  address: string,
  coordinates: [number, number] | null,
  timeZone: string,
  dailyReset: string | null,
  parentId: string | null,
  operatingHours: Array<OperatingHoursItem>,
  operatingHoursLabels: Array<OperatingHoursLabelItem>,
  overrideDefault: boolean,
  overrideDefaultControlHidden: boolean,
  imageUrl: string,
  newImageFile?: any,
};

export function calculateOperatingHoursFromSpace(space: DensitySpace): Array<OperatingHoursItem> {
  if (!space.timeSegments) {
    return [];
  }

  return space.timeSegments.map(tsm => {
    const resetTimeSeconds = moment.duration(space.dailyReset).as('seconds');
    let startTimeSeconds = moment.duration(tsm.start).as('seconds');
    let endTimeSeconds = moment.duration(tsm.end).as('seconds');

    // Time segments where the start time or end time is before the reset time go overnight, so add
    // 24 hours (don't have to worry about DST here, since time segments are scheduled on a fxed
    // 24-hour span) to the start or end time.
    if (startTimeSeconds < resetTimeSeconds) {
      startTimeSeconds += moment.duration('24:00:00').as('seconds');
    }
    if (endTimeSeconds <= resetTimeSeconds) {
      endTimeSeconds += moment.duration('24:00:00').as('seconds');
    }

    return {
      id: tsm.id,
      label: tsm.label,
      startTimeSeconds,
      endTimeSeconds,
      daysAffected: tsm.days,
    };
  }).sort((a, b) => {
    return a.startTimeSeconds - b.startTimeSeconds;
  });
}

// Given a space and the currently logged in user, return the initial state of eitehr the edit or
// new form.
function calculateInitialFormState({
  spaces,
  operatingHoursLabels,
  userDataSizeAreaDisplayUnit,

  // These values exist when a new space is being created
  formParentSpaceId,
  formSpaceType,
}): AdminLocationsFormState {
  const space = spaces.data.find(s => s.id === spaces.selected) || {
    parentId: formParentSpaceId,
    spaceType: formSpaceType,
    timeSegments: [],
  };
  const parentSpace = spaces.data.find(s => s.id === space.parentId) || {};

  return {
    // General information module
    name: space.name || '',
    spaceType: space.spaceType,
    'function': space['function'] || null,
    parentId: space.parentId,
    imageUrl: space.imageUrl,


    // Metadata module
    annualRent: space.annualRent || '',
    sizeArea: space.sizeArea || '',
    sizeAreaUnit: space.sizeAreaUnit || userDataSizeAreaDisplayUnit || SQUARE_FEET,
    currencyUnit: space.currencyUnit || 'USD',
    capacity: space.capacity || '',
    targetCapacity: space.targetCapacity || '',
    floorLevel: space.floorLevel || '',


    // Address module
    address: space.address || '',
    coordinates: space.latitude && space.longitude ? (
      [space.latitude, space.longitude]
    ) : null,


    // Operating hours module
    timeZone: space.timeZone || parentSpace.timeZone || moment.tz.guess(), // Guess the time zone
    dailyReset: space.dailyReset || parentSpace.dailyReset || '04:00',

    // Override default is always on and the control is hidden if this is the top level space in the
    // tree. Otherwise, it's enabled if the space has some of its own time segments
    overrideDefault: space.parentId === null ? true : (space.inheritsTimeSegments || false),
    overrideDefaultControlHidden: space.parentId === null,

    operatingHours: calculateOperatingHoursFromSpace(space),
    operatingHoursLabels: operatingHoursLabels.map(i => ({id: i, name: i}))
  };
}

export default function spaceManagement(state=initialState, action) {
  switch (action.type) {

  case ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW:
    return {
      ...state,
      formParentSpaceId: action.parentSpaceId,
      formSpaceType: action.spaceType,
    };

  case ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT:
    return {
      ...state,
      spaces: {
        ...state.spaces,
        selected: action.spaceId,
      },
    };

  // Keep a copy of `sizeAreaDisplayUnit` in this reducer as it is needed when calculating the
  // initial form state.
  case USER_SET: {
    const user = objectSnakeToCamel<DensityUser>(action.data);
    return { ...state, userDataSizeAreaDisplayUnit: user.sizeAreaDisplayUnit };
  }
  case USER_PUSH: {
    const user = objectSnakeToCamel(action.data);
    if (user.sizeAreaDisplayUnit) {
      return { ...state, userDataSizeAreaDisplayUnit: user.sizeAreaDisplayUnit };
    } else {
      return state;
    }
  }

  case SPACE_MANAGEMENT_SET_DATA:
    const newState = {
      ...state,
      view: 'VISIBLE',
      spaces: {
        ...state.spaces,
        data: action.spaces.map(s => objectSnakeToCamel<DensitySpace>(s)),
      },
      spaceHierarchy: action.hierarchy,
      operatingHoursLabels: action.labels,
    };
    newState.formState = calculateInitialFormState(newState);
    return newState;

  case SPACE_MANAGEMENT_ERROR:
    return {
      ...state,
      view: 'ERROR',
      error: action.error.message || action.error,
    };

  case SPACE_MANAGEMENT_UPDATE_FORM_STATE:
    return {
      ...state,
      formState: { ...state.formState, [action.key]: action.value },
    };

  default:
    return state;
  }
}
