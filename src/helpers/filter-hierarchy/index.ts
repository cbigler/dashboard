import { CoreSpace } from "@density/lib-api-types/core-v2/spaces";

export function getParentsOfSpace(spaces: Array<CoreSpace>, initialSpace: CoreSpace, throwError = true) {
  const parents: any[] = [];

  if (!initialSpace) {
    throw new Error(`Invalid space passed to getParentsOfSpace`);
  }

  let space: CoreSpace | undefined = initialSpace;
  while (true) {
    // Check for space hierarchies that are cyclical - ie, we come across a space that has already
    // been visited previously in this calculation.
    if (parents.indexOf(space.id) !== -1) {
      throw new Error(`Cyclical space hierarchy detected! This isn't allowed.`);
    }

    // Add the current space as the next space in the list of parents.
    parents.push(space.id);

    if (typeof space.parent_id === 'undefined' || space.parent_id === null) {
      return parents;
    }

    // Find the next parent space for the next loop iteration.
    const parent_id = space.parent_id;
    // eslint-disable-next-line no-loop-func
    space = spaces.find(s => s.id === space?.parent_id);
    if (!space) {
      if (throwError) {
        throw new Error(`No such space found with id ${parent_id}`);
      } else {
        return parents;
      }
    }
  }
}

export function getChildrenOfSpace(spaces, initialSpace) {
  return spaces.filter(space => {
    const parents = getParentsOfSpace(spaces, space, false);
    return parents.includes(initialSpace.id);
  }).map(s => s.id);
}

export function isParentSelected(spaces, space_id, selectedIds) {
  const space = spaces.find(x => x.id === space_id);
  if (space) {
    return getParentsOfSpace(spaces, space, false).reduce((acc, next, index) => (
      acc || (index > 0 && selectedIds.includes(next))
    ), false);
  } else {
    return false;
  }
}
