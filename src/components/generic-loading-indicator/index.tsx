import React from 'react';
import styles from './styles.module.scss';

export default function GenericLoadingIndicator() {
  return (
    <div className={styles.loadingIndicator}>
      <div></div><div></div><div></div><div></div>
    </div>
  );
}
