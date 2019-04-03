import React from 'react';
import styles from './styles.module.scss';

export default function %COMPONENTUPPERCAMEL%({
  name,
}) {
  return (
    <div className={styles.%COMPONENTCAMEL%}>
      {name ? `Hello ${name}` : 'Hello World!'}
    </div>
  );
}
