import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

export default function Toast({ visible, onDismiss, children }) {
  return (
    <div className={classnames('toast', {visible})}>
      <span className="toast-text">{children}</span>
      <span role="button" className="toast-dismiss" onClick={onDismiss}>Dismiss</span>
    </div>
  );
}
