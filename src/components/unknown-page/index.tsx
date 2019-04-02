import React from 'react';
import styles from './styles.module.scss'

export default function UnknownPage({ invalidUrl }) {
  return (
    <div className={styles.unknownPage}>
      <h1>We've never heard of {invalidUrl || 'this page'}.</h1>
      <a href="#/">Go back home.</a>
    </div>
  );
}
