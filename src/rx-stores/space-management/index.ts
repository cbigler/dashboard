import moment from 'moment';

import { INCHES, CENTIMETERS, SQUARE_FEET } from '@density/lib-helpers';
import { CoreSpaceTimeSegment, CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { CoreDoorway, CoreDoorwaySpace } from '@density/lib-api-types/core-v2/doorways';

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
import { COLLECTION_SPACES_CREATE } from '../../rx-actions/collection/spaces-legacy/create';
import { COLLECTION_SPACES_UPDATE } from '../../rx-actions/collection/spaces-legacy/update';
import { SPACE_MANAGEMENT_PUSH_DOORWAY } from '../../rx-actions/space-management/push-doorway';
import createRxStore from '..';
import { COLLECTION_SPACES_DESTROY } from '../../rx-actions/collection/spaces-legacy/destroy';
import { GlobalAction } from '../../types/rx-actions';
import { SPACE_MANAGEMENT_DOORWAY_DELETED } from '../../rx-actions/space-management/doorway-deleted';


export type SpaceManagementState = {
  view: 'LOADING_INITIAL' | 'LOADING_SEND_TO_SERVER' | 'VISIBLE' | 'ERROR',
  error: unknown,
  spaces: {
    data: CoreSpace[],
    selected: null | string,
  },
  doorways: CoreDoorway[],
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
  space_type: string,
  'function': string | null | undefined,
  annual_rent: any,
  size_area: any,
  size_area_unit: 'square_feet' | 'square_meters',
  currencyUnit: 'USD',
  capacity: string,
  target_capacity: string,
  floor_level: string,
  address: string,
  coordinates: [number, number] | null,
  time_zone: string,
  daily_reset: string | null,
  parent_id: string | null,
  doorwaysFilter: string,
  doorways: Array<DoorwayItem>,
  operatingHours: Array<OperatingHoursItem>,
  operatingHoursLabels: Array<OperatingHoursLabelItem>,
  overrideDefault: boolean,
  overrideDefaultControlHidden: boolean,
  image_url: string,
  newImageFile?: any,
  tags?: Array<{
    name: string,
    operationToPerform: 'CREATE' | 'DELETE' | null,
  }>,
  assigned_teams?: Array<{
    id: string,
    name: string,
    operationToPerform: 'CREATE' | 'DELETE' | null,
  }>,
};

export type DoorwayItem = {
  id: string,
  name: string,
  spaces: CoreDoorway["spaces"],
  list: 'TOP' | 'BOTTOM',
  selected: boolean,
  sensor_placement: CoreDoorwaySpace['sensor_placement'] | null,
  updateHistoricCounts: boolean,
  initialSensorPlacement: number | null,
  link_id: string | null,
  operationToPerform: 'CREATE' | 'UPDATE' | 'DELETE' | null,
  linkExistsOnServer: boolean,
  height: string | null,
  width: string | null,
  measurementUnit: typeof INCHES | typeof CENTIMETERS | null,
  clearance: boolean | null,
  power_type: 'POWER_OVER_ETHERNET' | 'AC_OUTLET' | null,
  inside_image_url: string | null,
  outside_image_url: string | null,
}

function getMeasurementUnitFromDoorway(doorway: CoreDoorway): DoorwayItem['measurementUnit'] {
  if (!doorway.environment) return null;
  if (!doorway.environment.measurement_unit) return null;
  const unitString = doorway.environment.measurement_unit;
  if (unitString === INCHES) return INCHES;
  if (unitString === CENTIMETERS) return CENTIMETERS;
  return null;
}

function makeDoorwayItemFromDensityDoorway(space_id: string | null, doorway: CoreDoorway, initialSensorPlacement: CoreDoorwaySpace['sensor_placement'] | null = null): DoorwayItem {
  const linkedToSpace = doorway.spaces ? doorway.spaces.find(x => x.id === space_id) : null;
  const sensor_placement = linkedToSpace ? linkedToSpace.sensor_placement : initialSensorPlacement;

  return {
    id: doorway.id,
    name: doorway.name,
    spaces: doorway.spaces,

    height: doorway.environment && doorway.environment.height ? `${doorway.environment.height}` : null,
    width: doorway.environment && doorway.environment.width ? `${doorway.environment.width}` : null,
    measurementUnit: getMeasurementUnitFromDoorway(doorway),
    clearance: doorway.environment ? doorway.environment.clearance : null,
    power_type: doorway.environment ? doorway.environment.power_type : null,
    inside_image_url: doorway.environment ? doorway.environment.inside_image_url : null,
    outside_image_url: doorway.environment ? doorway.environment.outside_image_url : null,

    list: linkedToSpace ? 'TOP' : 'BOTTOM',
    selected: linkedToSpace ? true : false,
    sensor_placement,
    initialSensorPlacement: sensor_placement,
    updateHistoricCounts: false,
    link_id: linkedToSpace ? linkedToSpace.link_id : null,
    operationToPerform: null,
    linkExistsOnServer: linkedToSpace ? true : false,
  };
}

export function calculateOperatingHoursFromSpace(
  space: {daily_reset: string, time_segments: Array<CoreSpaceTimeSegment>},
): Array<OperatingHoursItem> {
  if (!space.time_segments) {
    return [];
  }

  return space.time_segments.map(tsm => {
    const resetTimeSeconds = moment.duration(space.daily_reset).as('seconds');
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
    parent_id: formParentSpaceId,
    space_type: formSpaceType,
    time_segments: [],
    doorways: [],
  };
  const parentSpace = spaces.data.find(s => s.id === space.parent_id) || {};

  // Whether the time segments editor should be enabled, or the space should inherit
  let overrideDefault = false;
  if (space.parent_id === null) {
    overrideDefault = true;
  } else if (typeof space.inherits_time_segments === 'boolean') {
    overrideDefault = !space.inherits_time_segments;
  }

  return {
    // General information module
    id: space.id || null,
    name: space.name || '',
    space_type: space.space_type,
    'function': space['function'],
    parent_id: space.parent_id,
    image_url: space.image_url,


    // Metadata module
    annual_rent: space.annual_rent || '',
    size_area: space.size_area || '',
    size_area_unit: space.size_area_unit || userDataSizeAreaDisplayUnit || SQUARE_FEET,
    currencyUnit: space.currencyUnit || 'USD',
    capacity: space.capacity || '',
    target_capacity: space.target_capacity || '',
    floor_level: space.floor_level || '',


    // Address module
    address: space.address || '',
    coordinates: space.latitude && space.longitude ? (
      [space.latitude, space.longitude]
    ) : null,


    // Tags module
    tags: (space.tags || []).map(name => ({name, operationToPerform: null})),


    // Team assignments module
    assigned_teams: (space.assigned_teams || []).map(t => ({
      id: t.id,
      name: t.name,
      operationToPerform: null,
    })),

    // Doorway module (hydrate with extra form state for each doorway)
    doorwaysFilter: '',
    doorways: doorways.map(d => makeDoorwayItemFromDensityDoorway(space.id, d)) as Array<DoorwayItem>,


    // Operating hours module
    time_zone: space.time_zone || parentSpace.time_zone || moment.tz.guess(), // Guess the time zone
    daily_reset: space.daily_reset || parentSpace.daily_reset || '04:00',

    // Override default is always on and the control is hidden if this is the top level space in the
    // tree. Otherwise, it's enabled if the space has some of its own time segments
    overrideDefault,
    overrideDefaultControlHidden: space.parent_id === null,
    operatingHours: calculateOperatingHoursFromSpace(space),
    operatingHoursLabels: operatingHoursLabels.map(i => ({id: i, name: i}))
  };
}

// Given the state of the form, convert that state back into fields that can be sent in the body of
// a PUT to the space.
export function convertFormStateToSpaceFields(
  formState: AdminLocationsFormState,
  space_type: CoreSpace["space_type"],
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
    space_type: formState.space_type,
    'function': formState['function'] || null,
    parent_id: formState.parent_id,
    floor_level: space_type === 'floor' ? parseIntOrNull(formState.floor_level) : undefined,

    newTags: formState.tags,
    newAssignedTeams: formState.assigned_teams,

    annual_rent: space_type === 'building' ? parseIntOrNull(formState.annual_rent) : undefined,
    size_area: space_type !== 'campus' ? parseIntOrNull(formState.size_area) : undefined,
    size_area_unit: space_type === 'building' ? formState.size_area_unit : undefined,
    currencyUnit: formState.currencyUnit,
    capacity: space_type !== 'campus' ? parseIntOrNull(formState.capacity) : undefined,
    target_capacity: space_type !== 'campus' ? parseIntOrNull(formState.target_capacity) : undefined,

    address: formState.address && formState.address.length > 0 ? formState.address : null,
    latitude: formState.coordinates ? formState.coordinates[0] : null,
    longitude: formState.coordinates ? formState.coordinates[1] : null,

    daily_reset: formState.daily_reset,
    time_zone: formState.time_zone,

    newImageFile: formState.newImageFile,
    operatingHours: formState.operatingHours,

    links: formState.doorways.map(i => ({
      id: i.link_id,
      doorway_id: i.id,
      sensor_placement: i.sensor_placement,
      operationToPerform: i.operationToPerform,
      updateHistoricCounts: i.updateHistoricCounts,
    })),

    inherits_time_segments: !formState.overrideDefault,
  };
}

// HACK: tricking the compiler temporarily here
type Action = GlobalAction | {
  type: typeof COLLECTION_SPACES_CREATE | typeof COLLECTION_SPACES_UPDATE | typeof COLLECTION_SPACES_DESTROY,
}

export function spaceManagementReducer(state: SpaceManagementState, action: Action): SpaceManagementState {
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
      formSpaceType: action.space_type,
      spaces: { ...state.spaces, selected: null },
    };

  case ROUTE_TRANSITION_ADMIN_LOCATIONS_EDIT:
    return {
      ...state,
      view: 'LOADING_INITIAL',
      error: null,
      spaces: {
        ...state.spaces,
        selected: action.space_id,
      },
      formParentSpaceId: null,
      formSpaceType: null,
    };

  case COLLECTION_SPACES_CREATE:
  case COLLECTION_SPACES_DESTROY:
  case COLLECTION_SPACES_UPDATE:
    return {
      ...state,
      view: 'LOADING_SEND_TO_SERVER',
      error: null,
    };

  // Keep a copy of `size_area_display_unit` in this reducer as it is needed when calculating the
  // initial form state.
  case USER_SET: {
    const user = action.data;
    return { ...state, userDataSizeAreaDisplayUnit: user.size_area_display_unit };
  }
  case USER_PUSH: {
    const user = action.item;
    if (user.size_area_display_unit) {
      return { ...state, userDataSizeAreaDisplayUnit: user.size_area_display_unit };
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
        data: action.spaces,
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
    const newDoorwayItem: DoorwayItem = {
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
            return {...item, ...action.item as CoreDoorway};
          } else {
            return item;
          }
        }),

        // Add new items
        ...(
          state.doorways.find((i: any) => i.id === action.item.id) === undefined ?
            [action.item as CoreDoorway] :
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
  case SPACE_MANAGEMENT_DOORWAY_DELETED:
    return {
      ...state,
      doorways: state.doorways.filter((item: CoreDoorway) => action.doorway_id !== item.id),
      formState: {
        ...state.formState,
        doorways: state.formState.doorways.filter(item => action.doorway_id !== item.id),
      },
    };

  case SPACE_MANAGEMENT_ERROR:
    return {
      ...state,
      view: 'ERROR',
      error: action.error instanceof Error ? action.error.message : action.error,
    };

  case SPACE_MANAGEMENT_FORM_UPDATE:
    return {
      ...state,
      formState: {
        ...state.formState,
        [action.key]: action.value,
      },
    };

  case SPACE_MANAGEMENT_FORM_DOORWAY_PUSH:
    return {
      ...state,
      formState: {
        ...state.formState,
        doorways: [
          ...state.formState.doorways,
          {
            ...makeDoorwayItemFromDensityDoorway(state.spaces.selected, action.doorway),
            list: 'BOTTOM',
            selected: true,
            sensor_placement: action.sensor_placement,
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
