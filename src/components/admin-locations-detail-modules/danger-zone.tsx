import React from 'react';
import styles from './danger-zone.module.scss';

import { Button } from '@density/ui/src';

import collectionSpacesDestroy from '../../rx-actions/collection/spaces-legacy/destroy';
import showModal from '../../rx-actions/modal/show';
import { showToast } from '../../rx-actions/toasts';

import AdminLocationsDetailModule from './index';
import useRxStore from '../../helpers/use-rx-store';
import SpacesLegacyStore from '../../rx-stores/spaces-legacy';
import SpaceManagementStore from '../../rx-stores/space-management';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

function AdminLocationsDetailModulesDangerZoneUnconnected({
  selectedSpace,
  onShowConfirm
}: {
  selectedSpace: CoreSpace,
  onShowConfirm: (space: CoreSpace) => void
}) {
  return (
    <AdminLocationsDetailModule error title="Danger Zone">
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <h4>Delete this space</h4>
          <span>Once deleted, it will be gone forever. Please be certain.</span>
        </div>
        <div className={styles.right}>
          <Button
            variant="underline"
            type="danger"
            onClick={() => onShowConfirm(selectedSpace)}
          >Delete this space</Button>
        </div>
      </div>
    </AdminLocationsDetailModule>
  );
}

const ConnectedAdminLocationsDetailModulesDangerZone: React.FC = () => {
  
  const dispatch = useRxDispatch();
  const spaces = useRxStore(SpacesLegacyStore)
  const spaceManagement = useRxStore(SpaceManagementStore);

  // FIXME: this seems like a dubious way to juggle across stores...
  const selectedSpace = spaceManagement.spaces.data.find(s => s.id === spaces.selected);
  
  const onShowConfirm = (space: CoreSpace) => {
    showModal(dispatch, 'MODAL_CONFIRM', {
      prompt: 'Are you sure you want to delete this space?',
      confirmText: 'Delete',
      optimistic: true,
      callback: async () => {
        const ok = await collectionSpacesDestroy(dispatch, space);
        if (ok) {
          showToast(dispatch, { text: 'Space deleted successfully' });
        } else {
          showToast(dispatch, { type: 'error', text: 'Error deleting space' });
        }
        // FIXME: this seems like a bad idea to have this just chilling in this callback
        window.location.href = `#/admin/locations/${space.parent_id}`;
      }
    });
  }
  return selectedSpace ? (
    <AdminLocationsDetailModulesDangerZoneUnconnected
      selectedSpace={selectedSpace}
      onShowConfirm={onShowConfirm}
    />
  ) : null;
}
export default ConnectedAdminLocationsDetailModulesDangerZone;
