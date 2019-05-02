import React from 'react';
import styles from './styles.module.scss';

export default function AdminLocationsEmptyState({text=`You haven't added any locations yet. Add one to get started.`}) {
  return (
    <div className={styles.emptyStateWrapper}>
      <div className={styles.emptyState}>
        {text}
      </div>
    </div>
  );
}
