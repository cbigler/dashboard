import React from 'react';
import styles from './styles.module.scss';

import ImageRetry from '../image-retry';

export default function AdminLocationsListViewImage({ space }) {
  return (
    <div className={styles.wrapper}>
      <ImageRetry
        src={space.imageUrl}
        alt="Space image"
        retries={5}
      />
    </div>
  );
}
