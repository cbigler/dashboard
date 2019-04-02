import React from 'react';
import styles from './styles.module.scss';

export default function GenericLoadingState() {
  return (
    <div className={styles.genericLoadingState}>
      <span className={styles.genericLoadingStateLoading}>Loading</span>
      <span className={styles.genericLoadingStateMessage}>
        Please stand by...
      </span>
    </div>
  );
}
