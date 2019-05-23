import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { SQUARE_FEET } from '../../helpers/convert-unit/index';
import { DensityUser, DensityTimeSegment, DensitySpace, DensityDoorway } from '../../types';

import { ROUTE_TRANSITION_ADMIN_LOCATIONS } from '../../actions/route-transition/admin-locations';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW } from '../../actions/route-transition/admin-locations-new';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT } from '../../actions/route-transition/admin-locations-edit';
import { USER_SET } from '../../actions/user/set';
import { USER_PUSH } from '../../actions/user/push';
import { SPACE_MANAGEMENT_FORM_UPDATE } from '../../actions/space-management/form-update';
import { SPACE_MANAGEMENT_FORM_DOORWAY_PUSH } from '../../actions/space-management/form-doorway-push';
import { SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE } from '../../actions/space-management/form-doorway-update';
import { SPACE_MANAGEMENT_SET_DATA } from '../../actions/space-management/set-data';
import { SPACE_MANAGEMENT_ERROR } from '../../actions/space-management/error';
import { COLLECTION_SPACES_CREATE } from '../../actions/collection/spaces/create';
import { COLLECTION_SPACES_UPDATE } from '../../actions/collection/spaces/update';

const initialState = {
  view: 'LOADING_INITIAL',
  error: null,

  spaces: {
    data: [],
    selected: null,
  },
  doorways: [],
  spaceHierarchy: {},
  operatingHoursLabels: [],

  formParentSpaceId: null,
  formSpaceType: null,
  formState: {} as AdminLocationsFormState,
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
  doorwaysFilter: string,
  doorways: Array<DensityDoorway>,
  operatingHours: Array<OperatingHoursItem>,
  operatingHoursLabels: Array<OperatingHoursLabelItem>,
  overrideDefault: boolean,
  overrideDefaultControlHidden: boolean,
  imageUrl: string,
  newImageFile?: any,
};

export function calculateOperatingHoursFromSpace(
  space: {dailyReset: string, timeSegments: Array<DensityTimeSegment>},
): Array<OperatingHoursItem> {
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
  doorways,
  operatingHoursLabels,
  userDataSizeAreaDisplayUnit,

  // These values exist when a new space is being created
  formParentSpaceId,
  formSpaceType,
}): AdminLocationsFormState {

  // Find the current space
  const space = spaces.data.find(s => s.id === spaces.selected) || {
    parentId: formParentSpaceId,
    spaceType: formSpaceType,
    timeSegments: [],
  };
  const parentSpace = spaces.data.find(s => s.id === space.parentId) || {};

  // Whether the time segments editor should be enabled, or the space should inherit
  let overrideDefault = false;
  if (space.parentId === null) {
    overrideDefault = true;
  } else if (typeof space.inheritsTimeSegments === 'boolean') {
    overrideDefault = !space.inheritsTimeSegments;
  }

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


    // Doorway module (hydrate with extra form state for each doorway)
    doorwaysFilter: '',
    doorways: doorways.map(doorway => {
      const linkedSpace = doorway.spaces.find(x => x.id === space.id);
      return {
        ...doorway,
        _formState: {
          list: linkedSpace ? 'top' : 'bottom',
          selected: linkedSpace ? true : false,
          sensorPlacement: linkedSpace ? linkedSpace.sensorPlacement : null,
          initialSensorPlacement: linkedSpace ? linkedSpace.sensorPlacement : null
        }
      };
    }),


    // Operating hours module
    timeZone: space.timeZone || parentSpace.timeZone || moment.tz.guess(), // Guess the time zone
    dailyReset: space.dailyReset || parentSpace.dailyReset || '04:00',

    // Override default is always on and the control is hidden if this is the top level space in the
    // tree. Otherwise, it's enabled if the space has some of its own time segments
    overrideDefault,
    overrideDefaultControlHidden: space.parentId === null,
    operatingHours: calculateOperatingHoursFromSpace(space),
    operatingHoursLabels: operatingHoursLabels.map(i => ({id: i, name: i}))
  };
}

export default function spaceManagement(state=initialState, action) {
  switch (action.type) {

  case ROUTE_TRANSITION_ADMIN_LOCATIONS:
    return {
      ...state,
      view: 'LOADING_INITIAL',
      error: null,
      spaces: { ...state.spaces, selected: null },
    };

  case ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW:
    return {
      ...state,
      view: 'LOADING_INITIAL',
      error: null,
      formParentSpaceId: action.parentSpaceId,
      formSpaceType: action.spaceType,
      spaces: { ...state.spaces, selected: null },
    };

  case ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT:
    return {
      ...state,
      view: 'LOADING_INITIAL',
      error: null,
      spaces: {
        ...state.spaces,
        selected: action.spaceId,
      },
      formParentSpaceId: null,
      formSpaceType: null,
    };

  case COLLECTION_SPACES_CREATE:
  case COLLECTION_SPACES_UPDATE:
    return {
      ...state,
      view: 'LOADING_SEND_TO_SERVER',
      error: null,
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
      doorways: action.doorways,
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

  case SPACE_MANAGEMENT_FORM_UPDATE:
    return {
      ...state,
      formState: { ...state.formState, [action.key]: action.value },
    };

  case SPACE_MANAGEMENT_FORM_DOORWAY_PUSH:
    return {
      ...state,
      formState: {
        ...state.formState,
        doorways: [
          ...state.formState.doorways,
          {
            ...action.doorway,
            _formState: {
              list: 'bottom',
              selected: true,
              sensorPlacement: action.sensorPlacement,
              initialSensorPlacement: null
            }
          }
        ]
      }
    };

  case SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE:
    return {
      ...state,
      formState: {
        ...state.formState,
        doorways: state.formState.doorways.map(doorway => {
          if (doorway.id !== action.id) {
            return doorway;
          }
          return {
            ...doorway,
            _formState: {
              ...doorway._formState,
              [action.key]: action.value
            }
          };
        })
      }
    };

  default:
    return state;
  }
}
