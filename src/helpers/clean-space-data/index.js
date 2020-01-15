// Make a shallow copy of space data and clean it according to new API rules
export default function cleanSpaceData(spaceData) {
  const newSpaceData = Object.assign({}, spaceData);
  if (newSpaceData.space_type !== 'floor') {
    delete newSpaceData.floor_level;
  }
  if (newSpaceData.space_type !== 'building') {
    delete newSpaceData.size_area_unit;
    delete newSpaceData.annual_rent;
  }
  return newSpaceData;
}
