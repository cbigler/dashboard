import React from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';

export default function ErrorBar({message, showRefresh = false, modalOpen = false}) {
  if (message) {
    return <div className={classnames(
      styles.errorBar,
      styles.errorBarVisible,
      modalOpen ? styles.errorBarOverModal : null
    )}>
      <span className={styles.errorBarMessage}>
        {message instanceof Error ? message.message : message}
      </span>
      {showRefresh ? <span
        className={styles.errorBarLink}
        onClick={() => window.location.reload()}
      >Refresh</span> : null}
    </div>;
  } else {
    return <div className={classnames(styles.errorBar, styles.errorBarEmpty)} />;
  }
}
