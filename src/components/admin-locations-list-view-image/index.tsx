import React from 'react';
import styles from './styles.module.scss';

import { Icons } from '@density/ui';

export default function AdminLocationsListViewImage({ space }) {
  return (
    <div className={styles.wrapper}>
      <Icons.Image color="#fff" />
    </div>
  );
}
