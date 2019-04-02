import styles from './styles.module.scss';

import React from 'react';
import classnames from 'classnames';

export function AppBarSubnavLink({
  href,
  active,
  children
}) {
  return <a 
    href={href}
    className={classnames(styles.appBarSubnavLink, {
      [styles.selected]: active
    })}
  >
    {children}
  </a>;
}

export default function AppBarSubnav({children}) {
  return <div className={styles.appBarSubnav}>
    {children}
  </div>;
}
