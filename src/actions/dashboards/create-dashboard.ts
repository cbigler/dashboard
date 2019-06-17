import showModal from '../modal/show';
import core from '../../client/core';

import showToast from '../../actions/toasts';

export default function createDashboard() {
  return async dispatch => {
    const newDashboardName = await (new Promise(resolve => {
      dispatch(showModal('MODAL_PROMPT', {
        title: 'New Dashboard',
        prompt: 'Dashboard Name:',
        placeholder: 'ex. "Cafeteria Usage"',
        confirmText: 'Save',
        callback: data => resolve(data),
      }));
    }));

    let newDashboard;
    try {
      newDashboard = await core().post('/dashboards', {
        name: newDashboardName,
        report_set: [],
      });
    } catch (err) {
      dispatch(showToast({ text: 'Error creating dashboard.', type: 'error' }));
      return;
    }

    dispatch(showToast({text: 'Created dashboard.'}));
    window.location.href = `#/dashboards/${newDashboard.data.id}`;
  };
}
