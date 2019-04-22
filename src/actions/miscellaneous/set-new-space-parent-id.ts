export const SET_NEW_SPACE_PARENT_ID = 'SET_NEW_SPACE_PARENT_ID';

export default function setNewSpaceParentId(newSpaceParentId) {
  return { type: SET_NEW_SPACE_PARENT_ID, newSpaceParentId };
}
