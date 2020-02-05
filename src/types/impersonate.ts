import { CoreOrganization } from '@density/lib-api-types/core-v2/organizations';
import { CoreUser } from '@density/lib-api-types/core-v2/users';

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
  hidden: boolean,
  loading: boolean,
  organizations: Array<CoreOrganization>,
  organizationFilter: Any<FixInReview>,
  selectedOrganization: CoreOrganization | null,
  users: Array<CoreUser>,
  userFilter: Any<FixInReview>,
  selectedUser: CoreUser | null
};
