import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import { hideToast } from '../../actions/toasts';

import { Toast } from '@density/ui';

import styles from './styles.module.scss';

export function Toaster({
  toasts,
  onDismiss,
}) {
  return ReactDOM.createPortal(
    <div className={styles.toaster}>
      {toasts.map((toast, index) => {
        const type = toast.type || 'default';
        return <div key={index} style={{marginBottom: 10}} data-label={`toast-${type}`}>
          <Toast type={type} visible={toast.visible} onDismiss={() => onDismiss(toast.id)}>
            {toast.text}
          </Toast>
        </div>;
      })}
    </div>,
    document.body,
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
