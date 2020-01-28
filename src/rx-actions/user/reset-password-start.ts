export const USER_RESET_PASSWORD_START = 'USER_RESET_PASSWORD_START' as const;

export default function userResetPasswordStart(password: string) {
  return {
    type: USER_RESET_PASSWORD_START,
    password,
  }
}
