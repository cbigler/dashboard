import { DensityOrganization, DensityUser } from ".";

export enum ImpersonateActionTypes {
  IMPERSONATE_SET = 'IMPERSONATE_SET',
  IMPERSONATE_UNSET = 'IMPERSONATE_UNSET',
};

export type ImpersonateAction = {
  type: ImpersonateActionTypes.IMPERSONATE_SET,
  data: ImpersonateState,
} | {
  type: ImpersonateActionTypes.IMPERSONATE_UNSET,
};

export type ImpersonateState = {
  enabled: boolean,
  loading: boolean,
  organizations: Array<DensityOrganization>,
  organizationFilter: Any<FixInReview>,
  selectedOrganization: DensityOrganization | null,
  users: Array<DensityUser>,
  userFilter: Any<FixInReview>,
  selectedUser: DensityUser | null
};
