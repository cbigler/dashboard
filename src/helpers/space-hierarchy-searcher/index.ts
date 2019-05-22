import fuzzy from 'fuzzy';

import { SpaceHierarchyDisplayItem } from '../space-hierarchy-formatter/index';

// Filter a space hierarchy list by a given search phrase
export default function spaceHierarchySearcher(
  hierarchy: Array<SpaceHierarchyDisplayItem>,
  searchQuery: string,
): Array<SpaceHierarchyDisplayItem> {
  if (searchQuery.length === 0) {
    return hierarchy;
  }
  return hierarchy.filter(item => {
    // It can either match the name of the space
    if (fuzzy.match(searchQuery, item.space.name)) {
      return true;
    }

    // Or the name of a parent higher up in the hierarchy.
    const parent = item.ancestry.find(ancestor => {
      return fuzzy.test(searchQuery, ancestor.name);
    });
    if (parent) { return true; }

    // Or the name of a child lower down in the hierarchy.
    return item.children.find(child => {
      return fuzzy.test(searchQuery, child.name);
    });
  });
}
