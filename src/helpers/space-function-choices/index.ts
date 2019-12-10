import { DensitySpaceFunction } from '../../types';

const SPACE_FUNCTION_FORMATS = {
  [DensitySpaceFunction.BREAK_ROOM]: 'Break Room',
  [DensitySpaceFunction.CAFE]: 'Cafe',
  [DensitySpaceFunction.COLLABORATION]: 'Collaboration Room',
  [DensitySpaceFunction.CONFERENCE_ROOM]: 'Conference Room',
  [DensitySpaceFunction.DINING_AREA]: 'Dining Area',
  [DensitySpaceFunction.EVENT_SPACE]: 'Event Space',
  [DensitySpaceFunction.FOCUS_QUIET]: 'Focus / Quiet Room',
  [DensitySpaceFunction.GYM]: 'Gym',
  [DensitySpaceFunction.KITCHEN]: 'Kitchen',
  [DensitySpaceFunction.LAB]: 'Lab',
  [DensitySpaceFunction.LIBRARY]: 'Library',
  [DensitySpaceFunction.LOUNGE]: 'Lounge',
  [DensitySpaceFunction.MEETING_ROOM]: 'Meeting Room',
  [DensitySpaceFunction.OFFICE]: 'Office',
  [DensitySpaceFunction.PHONE_BOOTH]: 'Phone Booth',
  [DensitySpaceFunction.PLACE_OF_WORSHIP]: 'Place of Worship',
  [DensitySpaceFunction.RECEPTION]: 'Reception',
  [DensitySpaceFunction.RESTROOM]: 'Restroom',
  [DensitySpaceFunction.RETAIL]: 'Retail',
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
  Object.values(DensitySpaceFunction)
    .map(id => ({id, label: SPACE_FUNCTION_FORMATS[id]}))
);

// "Other" is not in the enum since its value is null, and typescript does not allow null in enums
SPACE_FUNCTION_CHOICES.push({ id: null, label: 'Other' });

export default SPACE_FUNCTION_CHOICES;
