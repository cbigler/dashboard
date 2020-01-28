export const USER_RESET_PASSWORD_SUCCESS = 'USER_RESET_PASSWORD_SUCCESS' as const;

export default function userResetPasswordSuccess() {
  return {
    type: USER_RESET_PASSWORD_SUCCESS,
  }
}
