import React from 'react';
import styles from './styles.module.scss';

export default function AnalyticsLoadingBar({width='100%'}: {width?: number | string}) {
  return (
    <div className={styles.wrapper} style={{width}}>
      <div className={styles.inner} />
    </div>
  );
}
