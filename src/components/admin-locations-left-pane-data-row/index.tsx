import React from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

export function AdminLocationsLeftPaneDataRow({
  includeTopBorder = true,
  includeBottomBorder = true,
  children
}) {
  return (
    <div
      className={classnames(styles.leftPaneDataRow, {
        [styles.topBorder]: includeTopBorder,
        [styles.bottomBorder]: includeBottomBorder,
      })}
    >{children}</div>
  );
}

export function AdminLocationsLeftPaneDataRowItem({id, label, value}) {
  return (
    <div className={styles.leftPaneDataRowItem}>
      <label htmlFor={`left-pane-data-row-item-${id}`}>{label}</label>
      <span id={`left-pane-data-row-item-${id}`}>{value}</span>
    </div>
  );
}

