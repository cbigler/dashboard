import { CoreUser } from "@density/lib-api-types/core-v2/users";

export const USER_PUSH = 'USER_PUSH' as const;

export default function userPush(item: CoreUser) {
  return {
    type: USER_PUSH,
    item,
  };
}
