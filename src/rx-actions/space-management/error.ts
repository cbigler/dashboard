export const SPACE_MANAGEMENT_ERROR = 'SPACE_MANAGEMENT_ERROR' as const;

export default function spaceManagementError(error: unknown) {
  return {
    type: SPACE_MANAGEMENT_ERROR,
    error,
  };
}
