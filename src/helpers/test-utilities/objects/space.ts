import { DensitySpace, DensitySpaceTypes, DensitySizeAreaUnitTypes } from '../../../types';
import { createIdGenerator } from '.';


const TEMPLATE: DensitySpace = {
  id: 'spc_test',
  name: '',
  address: null,
  ancestry: [],
  annualRent: null,
  annualRentCurrency: 'USD',
  assignedTeams: [],
  capacity: 1,
  createdAt: '2014-05-07T04:00:00.000Z',
  currentCount: 0,
  dailyReset: '04:00',
  description: '',
  doorways: [],
  floorLevel: null,
  function: null,
  imageUrl: null,
  inheritsTimeSegments: true,
  latitude: null,
  longitude: null,
  notes: '',
  parentId: null,
  sensorsTotal: 1,
  sizeArea: null,
  sizeAreaUnit: DensitySizeAreaUnitTypes.SQUARE_FEET,
  spaceMappings: [],
  spaceType: DensitySpaceTypes.SPACE,
  tags: [],
  targetCapacity: null,
  timeSegmentGroups: [],
  timeSegments: [],
  timeZone: 'America/New_York',
  updatedAt: '2019-08-13T15:08:18.293Z',
};

export const generateSpaceId = createIdGenerator('spc');

export function createSpace(partialSpace?: Partial<DensitySpace>) {
  return Object.assign({}, TEMPLATE, { id: generateSpaceId() }, partialSpace)
}
