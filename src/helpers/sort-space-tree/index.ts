export default function sortSpaceTree(spaces) {
  // put all the spaces that aren't in a hierarchy at the bottom of the list
  // this isn't pretty, but it works...
  let lonelySpaces: any = [];
  let hierarchySpaces: any = [];
  spaces.forEach(function(topLevelSpace, index){
    if(topLevelSpace.spaceType == "space") {
      lonelySpaces.push(topLevelSpace);
    } else {
      hierarchySpaces.push(topLevelSpace);
    }
  });
  return hierarchySpaces.concat(lonelySpaces);
}