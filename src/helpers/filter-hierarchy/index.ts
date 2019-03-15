export function getParentsOfSpace(spaces, initialSpace) {
  const parents: any[] = [];

  if (!initialSpace) {
    throw new Error(`Invalid space passed to getParentsOfSpace`);
  }

  let space = initialSpace;
  while (true) {
    // Check for space hierarchies that are cyclical - ie, we come across a space that has already
    // been visited previously in this calculation.
    if (parents.indexOf(space.id) !== -1) {
      throw new Error(`Cyclical space hierarchy detected! This isn't allowed.`);
    }

    // Add the current space as the next space in the list of parents.
    parents.push(space.id);

    if (typeof space.parentId === 'undefined' || space.parentId === null) {
      return parents;
    }

    // Find the next parent space for the next loop iteration.
    const parentId = space.parentId;
    // eslint-disable-next-line no-loop-func
    space = spaces.find(s => s.id === space.parentId);
    if (!space) {
      throw new Error(`No such space found with id ${parentId}`);
    }
  }
}

export default function filterHierarchy(spaces, parentId) {
  return spaces.filter(space => {
    return (
      space.spaceType === 'space' && /* must be of type space */
      getParentsOfSpace(spaces, space).indexOf(parentId) > 0 /* index 0 = current space */
    );
  });
}
