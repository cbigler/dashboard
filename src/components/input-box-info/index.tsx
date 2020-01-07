import React from 'react';
import styles from './styles.module.scss';

import {
  Icons,
} from '@density/ui/src';

export default function InputBoxInfo({
  children,
  color,
}) {
  return (
    <div className={styles.inputBoxInfo}>
      <div className={styles.inputBoxInfoTrigger}>
        <Icons.Info color={color}></Icons.Info>
      </div>
      <div className={styles.inputBoxInfoContent}>
        {children}
      </div>
    </div>
  );
}
