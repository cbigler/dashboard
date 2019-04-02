import styles from './styles.module.scss';
import * as React from 'react';

export default function AccountSetupHeader({
  greeter,
  detail,
}) {
  return <div className={styles.accountSetupHeaderContainer}>
    <div className={styles.accountSetupHeader}>
      <div className={styles.accountSetupHeaderGreeter}>{greeter}</div>
      <div className={styles.accountSetupHeaderDetail}>{detail}</div>
    </div>
  </div>;
}
