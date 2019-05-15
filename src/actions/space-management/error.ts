export const SPACE_MANAGEMENT_ERROR = 'SPACE_MANAGEMENT_ERROR';

export default function spaceManagementError(error) {
  return { type: SPACE_MANAGEMENT_ERROR, error };
}
