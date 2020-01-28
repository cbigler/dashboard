export const SPACE_MANAGEMENT_RESET = 'SPACE_MANAGEMENT_RESET' as const;

export default function spaceManagementReset() {
  return {
    type: SPACE_MANAGEMENT_RESET,
  };
}
