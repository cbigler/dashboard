import { CoreUser } from "@density/lib-api-types/core-v2/users";

export const USER_SET = 'USER_SET' as const;

export default function userSet(data: CoreUser) {
  return {
    type: USER_SET,
    data,
  };
}
