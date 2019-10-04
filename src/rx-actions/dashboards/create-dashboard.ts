import showModal from '../modal/show';
import core from '../../client/core';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';

import { showToast } from '../toasts';

export default async function createDashboard(dispatch) {
  const newDashboardName = await (new Promise(resolve => {
    showModal(dispatch, 'MODAL_PROMPT', {
      title: 'New Dashboard',
      prompt: 'Dashboard Name:',
      placeholder: 'ex. "Cafeteria Usage"',
      confirmText: 'Save',
      callback: data => resolve(data),
    });
  }));

  let newDashboard;
  try {
    newDashboard = await core().post('/dashboards', {
      name: newDashboardName,
      report_set: [],
    });
  } catch (err) {
    showToast(dispatch, { text: 'Error creating dashboard.', type: 'error' });
    return;
  }

  mixpanelTrack('Dashboard Created', {
    dashboard_id: newDashboard.data.id,
    dashboard_name: newDashboard.data.name,
  });

  showToast(dispatch, {text: 'Created dashboard.'});
  window.location.href = `#/dashboards/${newDashboard.data.id}`;
}
