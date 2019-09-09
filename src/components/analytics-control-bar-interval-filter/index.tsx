import React, { useState } from 'react';

import { QueryInterval } from '../../types/analytics';
import Filter, { FilterBold } from '../analytics-control-bar-filter';
import { ItemList } from '../analytics-control-bar-utilities';

import styles from './styles.module.scss';

const INTERVAL_CHOICES = [
  { id: QueryInterval.ONE_DAY, label: 'Day' },
  { id: QueryInterval.ONE_HOUR, label: 'Hour' },
  { id: QueryInterval.FIFTEEN_MINUTES, label: '15 Minutes' },
];

type AnalyticsIntervalSelectorProps = {
  value: QueryInterval,
  onChange: (choiceId: QueryInterval) => void
}

const AnalyticsIntervalSelector: React.FunctionComponent<AnalyticsIntervalSelectorProps> = function AnalyticsIntervalSelector({ value, onChange }) {
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
            onChange(choice.id as QueryInterval);
            // Blur the element that was selected if there was a focused element
            if (document.activeElement) { (document.activeElement as HTMLElement).blur(); }
            setOpen(false);
          }}
        />
      </Filter>
    </div>
  );
};

export default AnalyticsIntervalSelector;
