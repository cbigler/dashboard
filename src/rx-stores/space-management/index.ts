import moment from 'moment';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { SQUARE_FEET } from '../../helpers/convert-unit/index';
import { DensityUser, DensityTimeSegment, DensitySpace, DensityDoorway } from '../../types';

import { ROUTE_TRANSITION_ADMIN_LOCATIONS } from '../../rx-actions/route-transition/admin-locations';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_NEW } from '../../rx-actions/route-transition/admin-locations-new';
import { ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT } from '../../rx-actions/route-transition/admin-locations-edit';
import { USER_SET } from '../../rx-actions/user/set';
import { USER_PUSH } from '../../rx-actions/user/push';
import { SPACE_MANAGEMENT_FORM_UPDATE } from '../../rx-actions/space-management/form-update';
import { SPACE_MANAGEMENT_FORM_DOORWAY_PUSH } from '../../rx-actions/space-management/form-doorway-push';
import { SPACE_MANAGEMENT_FORM_DOORWAY_UPDATE } from '../../rx-actions/space-management/form-doorway-update';
import { SPACE_MANAGEMENT_SET_DOORWAYS } from '../../rx-actions/space-management/set-doorways';
import { SPACE_MANAGEMENT_SET_DATA } from '../../rx-actions/space-management/set-data';
import { SPACE_MANAGEMENT_ERROR } from '../../rx-actions/space-management/error';
import { SPACE_MANAGEMENT_RESET } from '../../rx-actions/space-management/reset';
import { COLLECTION_SPACES_CREATE } from '../../rx-actions/collection/spaces/create';
import { COLLECTION_SPACES_UPDATE } from '../../rx-actions/collection/spaces/update';
import { SPACE_MANAGEMENT_PUSH_DOORWAY } from '../../rx-actions/space-management/push-doorway';
import { SPACE_MANAGEMENT_DELETE_DOORWAY } from '../../rx-actions/space-management/delete-doorway';
import createRxStore from '..';


export type SpaceManagementState = {
  view: 'LOADING_INITIAL' | 'LOADING_SEND_TO_SERVER' | 'VISIBLE' | 'ERROR',
  error: unknown,
  spaces: {
    data: DensitySpace[],
    selected: null | string,
  },
  doorways: Any<FixInRefactor>[],
  spaceHierarchy: Any<FixInRefactor>,
  operatingHoursLabels: Any<FixInRefactor>[],
  
  formParentSpaceId: Any<FixInRefactor>,
  formSpaceType: Any<FixInRefactor>,
  formState: AdminLocationsFormState,
  userDataSizeAreaDisplayUnit: Any<FixInRefactor>,
}

export const initialState: SpaceManagementState = {
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
  // FIXME: no it isn't this type if it's an empty object...
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
  id: string | null,
  name: string,
  spaceType: string,
  'function': string | null | undefined,
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
  doorways: Array<DoorwayItem>,
  operatingHours: Array<OperatingHoursItem>,
  operatingHoursLabels: Array<OperatingHoursLabelItem>,
  overrideDefault: boolean,
  overrideDefaultControlHidden: boolean,
  imageUrl: string,
  newImageFile?: any,
  tags?: Array<{
    name: string,
    operationToPerform: 'CREATE' | 'DELETE' | null,
  }>,
  assignedTeams?: Array<{
    id: string,
    name: string,
    operationToPerform: 'CREATE' | 'DELETE' | null,
  }>,
};

export type DoorwayItem = {
  id: string,
  name: string,
  spaces: DensityDoorway["spaces"],
  list: 'TOP' | 'BOTTOM',
  selected: boolean,
  sensorPlacement: number | null,
  updateHistoricCounts: boolean,
  initialSensorPlacement: number | null,
  linkId: string | null,
  operationToPerform: 'CREATE' | 'UPDATE' | 'DELETE' | null,
  linkExistsOnServer: boolean,
  height: string | null,
  width: string | null,
  clearance: boolean | null,
  powerType: 'POWER_OVER_ETHERNET' | 'AC_OUTLET' | null,
  insideImageUrl: string | null,
  outsideImageUrl: string | null,
}

function makeDoorwayItemFromDensityDoorway(spaceId: string | null, doorway: DensityDoorway, initialSensorPlacement=null): DoorwayItem {
  const linkedToSpace = doorway.spaces ? doorway.spaces.find(x => x.id === spaceId) : null;
  const sensorPlacement = linkedToSpace ? linkedToSpace.sensorPlacement : initialSensorPlacement;
  return {
    id: doorway.id,
    name: doorway.name,
    spaces: doorway.spaces,

    height: doorway.environment && doorway.environment.height ? `${doorway.environment.height}` : null,
    width: doorway.environment && doorway.environment.width ? `${doorway.environment.width}` : null,
    clearance: doorway.environment ? doorway.environment.clearance : null,
    powerType: doorway.environment ? doorway.environment.powerType : null,
    insideImageUrl: doorway.environment ? doorway.environment.insideImageUrl : null,
    outsideImageUrl: doorway.environment ? doorway.environment.outsideImageUrl : null,

    list: linkedToSpace ? 'TOP' : 'BOTTOM',
    selected: linkedToSpace ? true : false,
    sensorPlacement,
    initialSensorPlacement: sensorPlacement,
    updateHistoricCounts: true,
    linkId: linkedToSpace ? linkedToSpace.linkId : null,
    operationToPerform: null,
    linkExistsOnServer: linkedToSpace ? true : false,
  };
}

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
      operationToPerform: null,
    };
  }).sort((a, b) => {
    return a.startTimeSeconds - b.startTimeSeconds;
  });
}

// Given a bunch of values fetched in the route transition, determine the initial state of the edit
// or new form.
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
    doorways: [],
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
    id: space.id || null,
    name: space.name || '',
    spaceType: space.spaceType,
    'function': space['function'],
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


    // Tags module
    tags: (space.tags || []).map(name => ({name, operationToPerform: null})),


    // Team assignments module
    assignedTeams: (space.assignedTeams || []).map(t => ({
      id: t.id,
      name: t.name,
      operationToPerform: null,
    })),

    // Doorway module (hydrate with extra form state for each doorway)
    doorwaysFilter: '',
    doorways: doorways.map(d => makeDoorwayItemFromDensityDoorway(space.id, d)) as Array<DoorwayItem>,


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

// Given the state of the form, convert that state back into fields that can be sent in the body of
// a PUT to the space.
export function convertFormStateToSpaceFields(
  formState: AdminLocationsFormState,
  spaceType: DensitySpace["spaceType"],
): object {
  function parseIntOrNull(string) {
    const result = parseInt(string, 10);
    if (isNaN(result)) {
      return null;
    } else {
      return result;
    }
  }
  return {
    name: formState.name,
    spaceType: formState.spaceType,
    'function': formState['function'] || null,
    parentId: formState.parentId,
    floorLevel: spaceType === 'floor' ? parseIntOrNull(formState.floorLevel) : undefined,

    newTags: formState.tags,
    newAssignedTeams: formState.assignedTeams,

    annualRent: spaceType === 'building' ? parseIntOrNull(formState.annualRent) : undefined,
    sizeArea: spaceType !== 'campus' ? parseIntOrNull(formState.sizeArea) : undefined,
    sizeAreaUnit: spaceType === 'building' ? formState.sizeAreaUnit : undefined,
    currencyUnit: formState.currencyUnit,
    capacity: spaceType !== 'campus' ? parseIntOrNull(formState.capacity) : undefined,
    targetCapacity: spaceType !== 'campus' ? parseIntOrNull(formState.targetCapacity) : undefined,

    address: formState.address && formState.address.length > 0 ? formState.address : null,
    latitude: formState.coordinates ? formState.coordinates[0] : null,
    longitude: formState.coordinates ? formState.coordinates[1] : null,

    dailyReset: formState.dailyReset,
    timeZone: formState.timeZone,

    newImageFile: formState.newImageFile,
    operatingHours: formState.operatingHours,

    links: formState.doorways.map(i => ({
      id: i.linkId,
      doorwayId: i.id,
      sensorPlacement: i.sensorPlacement,
      operationToPerform: i.operationToPerform,
      updateHistoricCounts: i.updateHistoricCounts,
    })),

    inheritsTimeSegments: !formState.overrideDefault,
  };
}

// FIXME: action should be GlobalAction
export function spaceManagementReducer(state: SpaceManagementState, action: Any<FixInRefactor>): SpaceManagementState {
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

  case SPACE_MANAGEMENT_SET_DOORWAYS:
    return {
      ...state,
      doorways: action.doorways,
    };

  case SPACE_MANAGEMENT_SET_DATA:
    const newState: SpaceManagementState = {
      ...state,
      view: 'VISIBLE',
      spaces: {
        ...state.spaces,
        data: action.spaces.map(s => objectSnakeToCamel<DensitySpace>(s)),
      },
      doorways: action.doorways,
      spaceHierarchy: action.hierarchy,
      operatingHoursLabels: action.labels,
    }
    newState.formState = calculateInitialFormState(newState);
    return newState;

  // Called when the doorway modal is used to add a new doorway or update an existing doorway, this
  // adds the doorway both to the doroways collection as well as to the doorway item list in the
  // formState.
  case SPACE_MANAGEMENT_PUSH_DOORWAY:
    const newDoorwayItem = {
      ...makeDoorwayItemFromDensityDoorway(
        state.spaces.selected,
        action.item,
        action.initialSensorPlacement,
      ),
      selected: true,
      list: 'TOP',
      operationToPerform: 'CREATE',
    };
    return {
      ...state,
      doorways: [
        // Update existing items
        ...state.doorways.map((item: any) => {
          if (action.item.id === item.id) {
            return {...item, ...objectSnakeToCamel<DensityDoorway>(action.item)};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.doorways.find((i: any) => i.id === action.item.id) === undefined ?
            [objectSnakeToCamel<DensityDoorway>(action.item)] :
            []
        ),
      ],
      formState: {
        ...state.formState,
        doorways: [
          // Update existing items
          ...state.formState.doorways.map((item: any) => {
            if (action.item.id === item.id) {
              return newDoorwayItem;
            } else {
              return item;
            }
          }),

          // Add new items
          ...(
            state.formState.doorways.find((i: any) => i.id === action.item.id) === undefined ?
              [newDoorwayItem] :
              []
          ),
        ] as Array<DoorwayItem>,
      },
    };

  // Called when the doorway modal deletes a doorway, removing it from both the doorways list and
  // the formState
  case SPACE_MANAGEMENT_DELETE_DOORWAY:
    return {
      ...state,
      doorways: state.doorways.filter((item: DensityDoorway) => action.doorwayId !== item.id),
      formState: {
        ...state.formState,
        doorways: state.formState.doorways.filter(item => action.doorwayId !== item.id),
      },
    };

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
            list: 'BOTTOM',
            selected: true,
            sensorPlacement: action.sensorPlacement,
            initialSensorPlacement: null
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
            [action.key]: action.value,
          };
        })
      }
    };
  
  case SPACE_MANAGEMENT_RESET:
    return initialState;

  default:
    return state;
  }
}

const SpaceManagementStore = createRxStore('SpaceManagementStore', initialState, spaceManagementReducer);
export default SpaceManagementStore;
