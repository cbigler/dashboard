export const USER_SET = 'USER_SET';

export default function userSet(data) {
  data.size_area_unit_default = 'square_meters';
  return { type: USER_SET, data };
}
