import React, { Fragment } from 'react';
import styles from './styles.module.scss';

import { Icons } from '@density/ui';

export default function AdminLocationsBreadcrumb({ space }) {
  if (space) {
    return (
      <div className={styles.breadcrumb}>
        <a href={`#/admin/locations`} className={styles.item}>Locations</a>
        <Icons.ChevronRight width={12} height={12} />

        {space.ancestry.slice().reverse().map((s, index) => {
          return (
            <Fragment key={s.id}>
              <a
                href={`#/admin/locations/${s.id}`}
                key={s.id}
                className={styles.item}
              >{s.name}</a>
              <Icons.ChevronRight width={12} height={12} />
            </Fragment>
          );
        })}

        <span className={styles.item}>
          <span className={styles.finalText}>{space.name}</span>
          <Icons.ChevronDown width={12} height={12} />
        </span>
      </div>
    );
  } else {
    return (
      <div className={styles.breadcrumb}>
        <a href="#/admin/locations" className={styles.item}>Locations</a>
      </div>
    );
  }
}
