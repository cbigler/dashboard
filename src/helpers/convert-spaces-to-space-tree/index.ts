export default function convertSpacesToSpaceTree(spaces) {
  let spacesByName = spaces.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  let spaceTree = function(spacesToBeTreed, root) {
    let rootArray: any = [];
    let spaceObject: any = {};
    spacesToBeTreed.forEach(function(space) {
      spaceObject[space.id] = {
        ...space, 
        children: (spaceObject[space.id] && spaceObject[space.id].children) || [] 
      };
      if (space.parentId === root) {
        rootArray.push(spaceObject[space.id]);
      } else {
        spaceObject[space.parentId] = spaceObject[space.parentId] || {};
        spaceObject[space.parentId].children = spaceObject[space.parentId].children || [];
        spaceObject[space.parentId].children.push(spaceObject[space.id]);
      }
    });
    return rootArray;
  }(spacesByName, null);

  // put all the spaces that aren't in a hierarchy at the bottom of the list
  // this isn't pretty, but it works...
  let lonelySpaces: any = []
  let hierarchySpaces: any = []
  spaceTree.forEach(function(topLevelSpace, index){
    if(topLevelSpace.spaceType == "space") {
      lonelySpaces.push(topLevelSpace)
    } else {
      hierarchySpaces.push(topLevelSpace)
    }
  })
  spaceTree = hierarchySpaces.concat(lonelySpaces)
  return spaceTree
}