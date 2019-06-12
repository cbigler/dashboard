import showModal from '../modal/show';

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

      console.log('TODO: make dashboard', newDashboardName);
      
      window.location.href = '#/dashboards/xxx';
  };
}
