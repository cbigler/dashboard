export const COLLECTION_ASSIGNED_TEAMS_ERROR = 'COLLECTION_ASSIGNED_TEAMS_ERROR';

export default function collectionAssignedTeamsError(error) {
  return { type: COLLECTION_ASSIGNED_TEAMS_ERROR, error };
}
