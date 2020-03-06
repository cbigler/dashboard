import React from 'react';
import styles from './styles.module.scss';

import { Icons } from '@density/ui/src';

// Render a blue card to use in empty states.
const EmptyCard: React.FunctionComponent<{ actions: React.ReactNode }> = ({actions, children}) => (
  <div className={styles.emptyCard}>
    <div className={styles.emptyCardBody}>
      <div className={styles.emptyCardBodyIcon}>
        <Icons.CloudSecure />
      </div>
      {children}
    </div>
    {actions ? (
      <div className={styles.emptyCardActions}>
        {actions}
      </div>
    ) : null}
  </div>
);

export default EmptyCard;
