import React from 'react';

export default function DashboardDispatchManagementModal({
  visible,
  dispatch,
  onCloseModal,
}) {
  if (visible) {
    return <div className="dashboard-dispatch-management-modal">
      Hello world <pre>{JSON.stringify(dispatch)}</pre>
      <button onClick={onCloseModal}>Close</button>
    </div>;
  } else {
    return null;
  }
}
