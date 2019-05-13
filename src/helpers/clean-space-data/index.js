// Make a shallow copy of space data and clean it according to new API rules
export default function cleanSpaceData(spaceData) {
  const newSpaceData = Object.assign({}, spaceData);
  if (newSpaceData.spaceType !== 'floor') {
    delete newSpaceData.floorLevel;
  }
  if (newSpaceData.spaceType !== 'building') {
    delete newSpaceData.sizeAreaUnit;
    delete newSpaceData.annualRent;
  }
  return newSpaceData;
}
