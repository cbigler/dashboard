import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

export default function DashboardDispatchManagementModal({
  visible,
  dispatch,
  onCloseModal,
}) {
  return ReactDOM.createPortal(
    (
      <div className={classnames('dashboard-dispatch-management-modal', {visible})}>
        <div className="dashboard-dispatch-management-modal-inner">
          <div className="dashboard-dispatch-management-modal-header-app-bar">
            {dispatch ? dispatch.name : 'New Dispatch'}
          </div>
          <div className="dashboard-dispatch-management-modal-split-container">
            <div className="dashboard-dispatch-management-modal-split left">
              Stuff goes here
            </div>
            <div className="dashboard-dispatch-management-modal-split right">
              More stuff goes here
              <pre>{JSON.stringify(dispatch)}</pre>
            </div>
          </div>
          <div className="dashboard-dispatch-management-modal-footer-app-bar">
            <span onClick={onCloseModal}>Cancel</span>
            <button>Save Dispatch</button>
          </div>
        </div>
      </div>
    ),
    document.body,
  );
}
