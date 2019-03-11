import { USER_PUSH } from './push';

export default function userImpersonate(impersonating) {
  return { type: USER_PUSH, item: {impersonating} };
}
