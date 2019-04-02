import React from 'react';
import styles from './styles.module.scss';

export default function GenericErrorState() {
  return (
    <div className={styles.genericErrorState}>
      <span className={styles.genericErrorStateWhoops}>Whoops</span>
      <span className={styles.genericErrorStateMessage}>
        Try refreshing the page, or contacting <a href="mailto:support@density.io">support</a>.
      </span>
    </div>
  );
}
