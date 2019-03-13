import { accounts } from '../../../client';
import collectionUsersPush from './push';
import collectionUsersError from './error';
import showToast from '../../toasts';

export const COLLECTION_USERS_INVITE_RESEND = 'COLLECTION_USERS_INVITE_RESEND';

export default function collectionUsersInviteResend(item) {
  return async dispatch => {
    dispatch({ type: COLLECTION_USERS_INVITE_RESEND, item });

    try {
      await accounts.users.invite_resend({id: item.id});
      item.invitationStatus = 'pending';
      dispatch(collectionUsersPush(item));
      dispatch(showToast({
        text: 'Invite sent successfully',
      }));
      return item;
    } catch (err) {
      dispatch(collectionUsersError(err));
      dispatch(showToast({
        text: 'Error sending invite',
        type: 'error',
      }));
      return false;
    }
  };
}
