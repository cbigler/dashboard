import { DensitySpaceHierarchyItem } from '../../types';

export type SpaceHierarchyDisplayItem = {
  depth: number, // How far indented this item needs to be
  space: DensitySpaceHierarchyItem & { parentId: string },

  // The below two fields (ancestry and children) aren't meant for display purposes and instead
  // exist so that math can be performed on the hierarchy such as filtering, extracting
  // sub-hierarchies, etc:

  // All of the spaces above it in the hierarchy (ordered so parents are first, and far off
  // decendants like great-grandparents are last)
  ancestry: Array<DensitySpaceHierarchyItem>,

  // All spaces under this space in the hierarchy
  children: Array<DensitySpaceHierarchyItem>,
};

const flat = (nestedArray) => nestedArray.reduce((a, b) => [...a, ...b], []);

export default function spaceHierarchyFormatter(
  hierarchy: Array<DensitySpaceHierarchyItem>
): Array<SpaceHierarchyDisplayItem> {
  function recurseHierarchy(space, ancestry=[] as Array<any>, depth = -1) {
    const parentId = ancestry.length > 0 ? ancestry[0].id : null;
    if (!space.children) {
      // Leaf of the tree
      return [
        { depth: depth + 1, ancestry, children: [], space: { ...space, parentId } },
      ];
    } else {
      // Regular node in the tree
      const children = flat(
        space.children
          .map(child => recurseHierarchy(child, [space, ...ancestry], depth + 1))
      );

      return [
        {
          depth: depth + 1,
          ancestry,
          children: children.map(c => c.space),
          space: { ...space, parentId }
        },
        ...children,
      ];
    }
  }

  return flat(hierarchy.map(space => recurseHierarchy(space)));
}
