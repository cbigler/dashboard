import { ActionTypesOf } from '../../types/rx-actions';
import error from './error';
import push from './push';
import resetPasswordStart from './reset-password-start';
import resetPasswordSuccess from './reset-password-success';
import set from './set';

export const userActions = {
  error,
  push,
  resetPasswordStart,
  resetPasswordSuccess,
  set,
}

export type UserAction = ActionTypesOf<typeof userActions>;
