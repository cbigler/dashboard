import React from 'react';
import { connect } from 'react-redux';
import styles from './danger-zone.module.scss';

import { Button, ButtonContext } from '@density/ui';

import collectionSpacesDestroy from '../../actions/collection/spaces/destroy';
import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';

import AdminLocationsDetailModule from './index';

function AdminLocationsDetailModulesDangerZoneUnconnected({selectedSpace, onShowConfirm}) {
  return (
    <AdminLocationsDetailModule error title="Danger Zone">
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <h4>Delete this space</h4>
          <span>Once deleted, it will be gone forever. Please be certain.</span>
        </div>
        <div className={styles.right}>
          <ButtonContext.Provider value="DELETE_BUTTON">
            <Button onClick={() => onShowConfirm(selectedSpace)}>Delete this Space</Button>
          </ButtonContext.Provider>
        </div>
      </div>
    </AdminLocationsDetailModule>
  );
}

export default connect(
  (state: any) => ({
    selectedSpace: state.spaceManagement.spaces.data.find(s => s.id === state.spaces.selected),
  }),
  (dispatch) => ({
    onShowConfirm(space) {
      dispatch<any>(showModal('MODAL_CONFIRM', {
        prompt: 'Are you sure you want to delete this space?',
        confirmText: 'Delete',
        callback: async () => {
          const ok = await dispatch<any>(collectionSpacesDestroy(space));
          if (ok) {
            dispatch<any>(showToast({ text: 'Space deleted successfully' }));
          } else {
            dispatch<any>(showToast({ type: 'error', text: 'Error deleting space' }));
          }
          window.location.href = `#/admin/locations/${space.parentId}`;
        }
      }));
    },
  }),
)(AdminLocationsDetailModulesDangerZoneUnconnected);
