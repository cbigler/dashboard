import React from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

export function AdminLocationsLeftPaneDataRow({includeTopBorder, children}) {
  return (
    <div
      className={classnames(styles.leftPaneDataRow, {[styles.topBorder]: includeTopBorder})}
    >{children}</div>
  );
}
AdminLocationsLeftPaneDataRow.defaultProps = { includeTopBorder: true };

export function AdminLocationsLeftPaneDataRowItem({id, label, value}) {
  return (
    <div className={styles.leftPaneDataRowItem}>
      <label htmlFor={`left-pane-data-row-item-${id}`}>{label}</label>
      <span id={`left-pane-data-row-item-${id}`}>{value}</span>
    </div>
  );
}

