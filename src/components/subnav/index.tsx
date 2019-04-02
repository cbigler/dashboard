import React from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';

export default function Subnav({children, visible = false}) {
  return <div className={classnames(styles.subnav, {[styles.visible]: visible})}>
    <ul className={styles.subnavItems}>{children}</ul>
  </div>;
}

export function SubnavItem({href, active = false, external = false, children}) {
  return <li className={classnames(styles.subnavItem, {[styles.active]: active, [styles.external]: external})}>
    <a target={external ? '_blank' : '_self'} href={href}>
      {children}
    </a>
  </li>;
}
