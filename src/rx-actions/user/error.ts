export const USER_ERROR = 'USER_ERROR' as const;

export default function userError(error: unknown) {
  return {
    type: USER_ERROR,
    error: error instanceof Error ? error.message : error,
  };
}
