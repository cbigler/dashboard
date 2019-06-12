export const USER_ERROR = 'USER_ERROR';

export default function userError(error) {
  return { type: USER_ERROR, error: error instanceof Error ? error.message : error };
}
