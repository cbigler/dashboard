import React, { useState } from 'react';
import styles from './styles.module.scss';

import Filter, { FilterBold } from '../analytics-control-bar-filter';
import { ItemList } from '../analytics-control-bar';

export enum AnalyticsInterval {
  DAY = 'DAY',
  HOUR = 'HOUR',
  FIFTEEN_MINUTES = 'FIFTEEN_MINUTES',
}

const INTERVAL_CHOICES = [
  { id: AnalyticsInterval.DAY, label: 'Day' },
  { id: AnalyticsInterval.HOUR, label: 'Hour' },
  { id: AnalyticsInterval.FIFTEEN_MINUTES, label: '15 Minutes' },
];

export default function AnalyticsIntervalSelector({ value, onChange }) {
  const [ open, setOpen ] = useState(false);

  const choice = INTERVAL_CHOICES.find(choice => choice.id === value);

  return (
    <div className={styles.analyticsIntervalSelector}>
      <span className={styles.analyticsIntervalLabel}>by</span>
      <Filter
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        text={<FilterBold>{choice ? choice.label : '(unknown interval)'}</FilterBold>}
      >
        <ItemList
          choices={INTERVAL_CHOICES}
          onClick={choice => {
            onChange(choice.id);
            // Blur the element that was selected if there was a focused element
            if (document.activeElement) { (document.activeElement as HTMLElement).blur(); }
            setOpen(false);
          }}
        />
      </Filter>
    </div>
  );
};
