import { ImpersonateActionTypes } from "../../types/impersonate";

export default function impersonateSet(data) {
  return { type: ImpersonateActionTypes.IMPERSONATE_SET, data } as const;
}

export function impersonateUnset() {
  return { type: ImpersonateActionTypes.IMPERSONATE_UNSET } as const;
}
