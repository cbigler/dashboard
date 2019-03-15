export const IMPERSONATE_SET = 'IMPERSONATE_SET';
export const IMPERSONATE_UNSET = 'IMPERSONATE_UNSET';

export default function impersonateSet(data) {
  return { type: IMPERSONATE_SET, data };
}

export function impersonateUnset() {
  return { type: IMPERSONATE_UNSET };
}
