import { DensitySpaceFunction } from '../../types';

const SPACE_FUNCTION_FORMATS = {
  [DensitySpaceFunction.BREAK_ROOM]: 'Break Room',
  [DensitySpaceFunction.CAFE]: 'Cafe',
  [DensitySpaceFunction.COLLABORATION]: 'Collaboration Room',
  [DensitySpaceFunction.CONFERENCE_ROOM]: 'Conference Room',
  [DensitySpaceFunction.EVENT_SPACE]: 'Event Space',
  [DensitySpaceFunction.FOCUS_QUIET]: 'Focus / Quiet Room',
  [DensitySpaceFunction.GYM]: 'Gym',
  [DensitySpaceFunction.KITCHEN]: 'Kitchen',
  [DensitySpaceFunction.LIBRARY]: 'Library',
  [DensitySpaceFunction.LOUNGE]: 'Lounge',
  [DensitySpaceFunction.MEETING_ROOM]: 'Meeting Room',
  [DensitySpaceFunction.OFFICE]: 'Office',
  [DensitySpaceFunction.PHONE_BOOTH]: 'Phone Booth',
  [DensitySpaceFunction.RECEPTION]: 'Reception',
  [DensitySpaceFunction.RESTROOM]: 'Restroom',
  [DensitySpaceFunction.THEATER]: 'Theater',
  [DensitySpaceFunction.WELLNESS_ROOM]: 'Wellness Room',
};

export function formatSpaceFunction(spaceFunction: DensitySpaceFunction): string {
  if (spaceFunction === null) {
    return 'Other';
  } else {
    return SPACE_FUNCTION_FORMATS[spaceFunction] || spaceFunction;
  }
}

const SPACE_FUNCTION_CHOICES: Array<{id: string | null, label: string}> = (
  Object.keys(DensitySpaceFunction)
    .map(id => ({id, label: formatSpaceFunction(DensitySpaceFunction[id])}))
);

// "Other" is not in the enum since its value is null, and typescript does not allow null in enums
SPACE_FUNCTION_CHOICES.push({ id: null, label: 'Other' });

console.log(SPACE_FUNCTION_CHOICES, DensitySpaceFunction, SPACE_FUNCTION_FORMATS)

export default SPACE_FUNCTION_CHOICES;
