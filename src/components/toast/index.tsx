import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

import styles from './styles.module.scss';

export default function Toast({ type, visible, onDismiss, children }) {
  return (
    <div className={classnames(styles.toast, styles[type], {[styles.visible]: visible})}>
      <span className={styles.toastText}>{children}</span>
      <span role="button" className={styles.toastDismiss} onClick={onDismiss}>Dismiss</span>
    </div>
  );
}
Toast.defaultProps = { type: 'default' };
