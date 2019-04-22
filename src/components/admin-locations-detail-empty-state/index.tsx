import React from 'react';
import styles from './styles.module.scss';

export default function AdminLocationsEmptyState() {
  return (
    <div className={styles.emptyStateWrapper}>
      <div className={styles.emptyState}>
        You haven't added any locations yet. Add one to get started.
      </div>
    </div>
  );
}
