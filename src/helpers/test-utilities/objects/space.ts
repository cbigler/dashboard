import { CoreSpace, CoreSpaceType, CoreSpaceSizeAreaUnit } from '@density/lib-api-types/core-v2/spaces';
import { createIdGenerator } from '.';


const TEMPLATE: CoreSpace = {
  id: 'spc_test',
  name: '',
  address: null,
  ancestry: [],
  annual_rent: null,
  annual_rent_currency: 'USD',
  assigned_teams: [],
  capacity: 1,
  created_at: '2014-05-07T04:00:00.000Z',
  current_count: 0,
  daily_reset: '04:00',
  description: '',
  doorways: [],
  floor_level: null,
  function: null,
  image_url: null,
  inherits_time_segments: true,
  latitude: null,
  longitude: null,
  notes: '',
  parent_id: null,
  sensors_total: 1,
  size_area: null,
  size_area_unit: CoreSpaceSizeAreaUnit.SQUARE_FEET,
  space_mappings: [],
  space_type: CoreSpaceType.SPACE,
  tags: [],
  target_capacity: null,
  time_segment_groups: [],
  time_segments: [],
  time_zone: 'America/New_York',
  updated_at: '2019-08-13T15:08:18.293Z',
  max_dwell_minutes: 5,
};

export const generateSpaceId = createIdGenerator('spc');

export function createSpace(partialSpace?: Partial<CoreSpace>) {
  return Object.assign({}, TEMPLATE, { id: generateSpaceId() }, partialSpace)
}
