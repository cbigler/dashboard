import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { hideToast } from '../../actions/toasts';

import Toast from '../toast/index';

export function Toaster({
  toasts,
  onDismiss,
}) {
  return ReactDOM.createPortal(
    <div className="toaster">
      {toasts.map((toast, index) => {
        const type = toast.type || 'default';
        return <div key={index} style={{marginBottom: 10}}>
          <Toast type={type} visible={toast.visible} onDismiss={() => onDismiss(toast.id)}>
            {toast.text}
          </Toast>
        </div>;
      })}
    </div>,
    document.body
  );
}

export default connect((state: any) => ({
  toasts: state.toasts,
}), dispatch => {
  return {
    onDismiss(id) {
      dispatch<any>(hideToast(id));
    },
  };
})(Toaster);
