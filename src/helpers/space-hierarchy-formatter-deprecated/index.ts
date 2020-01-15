const SPACE_TYPE_SORT_ORDER = [
  'campus',
  'building',
  'floor',
  'space',
];

function addZeroItemBeforeFirstSpaceOfType(items, zeroItem, space_type) {
  const firstSpaceOfTypeIndex = items.findIndex(i => {
    return (
      i.depth === 0 &&
      i.space.space_type === space_type
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

// XXX
// NOTE: this is deprecated, please use the new `space-hierarchy-formatter` helper instead
// XXX
export default function spaceHierarchyFormatterDeprecated(spaces, opts={renderZeroItems: true}) {
  // Find everything with a `parent_id` of `null` - they should go at the top of the list.
  const topLevelItems = spaces.filter(i => i.parent_id === null);

  function insertLowerItems(topLevelItems, depth=0) {
    return topLevelItems.sort((a, b) => {
      return SPACE_TYPE_SORT_ORDER.indexOf(a.space_type) - SPACE_TYPE_SORT_ORDER.indexOf(b.space_type);
    }).reduce((acc, topLevelItem) => {
      // Find all items that should be rendered under the given `topLevelItem`
      const itemsUnderThisTopLevelItem = spaces.filter(i => i.parent_id === topLevelItem.id);

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
    if (spaces.filter(i => i.space_type === 'floor').length === 0) {
      lowerItems = addZeroItemBeforeFirstSpaceOfType(lowerItems, {
        depth: 0,
        space: {
          id: 'zerofloors',
          disabled: true,
          name: 'Floor',
          space_type: 'floor',
        },
      }, 'space');
    }

    if (spaces.filter(i => i.space_type === 'building').length === 0) {
      lowerItems = addZeroItemBeforeFirstSpaceOfType(lowerItems, {
        depth: 0,
        space: {
          id: 'zerobuildings',
          disabled: true,
          name: 'Building',
          space_type: 'building',
        },
      }, 'floor');
    }

    if (spaces.filter(i => i.space_type === 'campus').length === 0) {
      lowerItems = addZeroItemBeforeFirstSpaceOfType(lowerItems, {
        depth: 0,
        space: {
          id: 'zerocampuses',
          disabled: true,
          name: 'Campus',
          space_type: 'campus',
        },
      }, 'building');
    }
  }

  return lowerItems;
}
