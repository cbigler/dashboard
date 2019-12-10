import React from 'react';
import styles from './styles.module.scss';

export default function AdminLocationsEmptyState({ heading=`You haven't added any locations yet.`, text=`Add one to get started.`}) {
  return (
    <div className={styles.emptyStateWrapper}>
      <div className={styles.emptyState}>
        {heading ? (<span className={styles.emptyStateHeading}>{heading}</span>) : ''}
        <span className={styles.emptyStateText}>{text}</span>
      </div>
    </div>
  );
}
