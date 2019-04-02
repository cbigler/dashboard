const SPACE_TYPE_SORT_ORDER = [
  'campus',
  'building',
  'floor',
  'space',
];

function addZeroItemBeforeFirstSpaceOfType(items, zeroItem, spaceType) {
  const firstSpaceOfTypeIndex = items.findIndex(i => {
    return (
      i.depth === 0 &&
      i.space.spaceType === spaceType
    );
  });
  if (firstSpaceOfTypeIndex === -1) {
    return [...items, zeroItem];
  }

  return [
    ...items.slice(0, firstSpaceOfTypeIndex),
    zeroItem,
    ...items.slice(firstSpaceOfTypeIndex),
  ];
}

export function spaceHierarchyFormatter(spaces, opts={renderZeroItems: true}) {
  // Find everything with a `parentId` of `null` - they should go at the top of the list.
  const topLevelItems = spaces.filter(i => i.parentId === null);

  function insertLowerItems(topLevelItems, depth=0) {
    return topLevelItems.sort((a, b) => {
      return SPACE_TYPE_SORT_ORDER.indexOf(a.spaceType) - SPACE_TYPE_SORT_ORDER.indexOf(b.spaceType);
    }).reduce((acc, topLevelItem) => {
      // Find all items that should be rendered under the given `topLevelItem`
      const itemsUnderThisTopLevelItem = spaces.filter(i => i.parentId === topLevelItem.id);

      return [
        ...acc,

        // The item to add to the list
        {depth, space: topLevelItem},

        // Add all children under this item (and their children, etc) below this item.
        ...insertLowerItems(itemsUnderThisTopLevelItem, depth+1),
      ];
    }, []);
  }

  // Generate the tree from the lost of top level items.
  let lowerItems = insertLowerItems(topLevelItems);

  // Insert the "zero items" - the items that indicate that there is zero of a particular class of
  // items such as floors, buildings, or campuses.
  if (opts.renderZeroItems) {
    if (spaces.filter(i => i.spaceType === 'floor').length === 0) {
      lowerItems = addZeroItemBeforeFirstSpaceOfType(lowerItems, {
        depth: 0,
        space: {
          id: 'zerofloors',
          disabled: true,
          name: 'Floor',
          spaceType: 'floor',
        },
      }, 'space');
    }

    if (spaces.filter(i => i.spaceType === 'building').length === 0) {
      lowerItems = addZeroItemBeforeFirstSpaceOfType(lowerItems, {
        depth: 0,
        space: {
          id: 'zerobuildings',
          disabled: true,
          name: 'Building',
          spaceType: 'building',
        },
      }, 'floor');
    }

    if (spaces.filter(i => i.spaceType === 'campus').length === 0) {
      lowerItems = addZeroItemBeforeFirstSpaceOfType(lowerItems, {
        depth: 0,
        space: {
          id: 'zerocampuses',
          disabled: true,
          name: 'Campus',
          spaceType: 'campus',
        },
      }, 'building');
    }
  }

  return lowerItems;
}

export default function spaceHierarchyFormatterNew(spaces) {
  function recurseHierarchy(space, parent = {} as any, depth = 0) {
    if (!space.children) {
      return [{ depth: depth + 1, space: { ...space, parentId: parent.id } }];
    } else {
      return [{
        depth: depth + 1,
        space: { ...space, parentId: parent.id }
      }, ...[].concat(
        ...space.children.map(child => recurseHierarchy(child, space, depth + 1))
      )];
    }
  }
  return spaces.reduce((acc, next) => acc.concat(recurseHierarchy(next)), []);
}
