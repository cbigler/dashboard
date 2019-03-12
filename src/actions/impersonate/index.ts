export const IMPERSONATE_SET = 'IMPERSONATE_SET';

export default function impersonateSet(data) {
  return { type: IMPERSONATE_SET, data };
}
