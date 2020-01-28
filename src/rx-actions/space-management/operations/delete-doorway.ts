import { showToast } from '../../../rx-actions/toasts';
import hideModal from '../../modal/hide';

import core from '../../../client/core';
import { spaceManagementActions } from '..';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';

export default async function spaceManagementDeleteDoorway(dispatch, doorway_id: CoreDoorway['id']) {
  try {
    await core().delete(`/doorways/${doorway_id}`);
  } catch (err) {
    showToast(dispatch, {type: 'error', text: 'Error deleting doorway'});
    return;
  }

  dispatch(spaceManagementActions.doorwayDeleted(doorway_id));
  // FIXME: this should probably be handled when the doorwayDeleted action is consumed
  showToast(dispatch, {text: 'Doorway deleted!'});
  hideModal(dispatch);
}
