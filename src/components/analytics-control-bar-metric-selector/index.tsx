import React, { useState } from 'react';

import { AnalyticsFocusedMetric } from '../../types/analytics';
import Selector, { QueryTextBold } from '../analytics-control-bar-selector';
import { ItemList } from '../analytics-control-bar-utilities';

import styles from './styles.module.scss';

const METRIC_CHOICES = [
  { id: AnalyticsFocusedMetric.MAX, label: 'Occupancy' },
  { id: AnalyticsFocusedMetric.UTILIZATION, label: 'Utilization' },
  { id: AnalyticsFocusedMetric.ENTRANCES, label: 'Entrances' },
  { id: AnalyticsFocusedMetric.EXITS, label: 'Exits' },
];

type AnalyticsFocusedMetricSelectorProps = {
  value: AnalyticsFocusedMetric,
  onChange: (choiceId: AnalyticsFocusedMetric) => void,
}

const AnalyticsFocusedMetricSelector: React.FunctionComponent<AnalyticsFocusedMetricSelectorProps> = function AnalyticsFocusedMetricSelector({ value, onChange }) {
  const [ open, setOpen ] = useState(false);

  const choice = METRIC_CHOICES.find(choice => choice.id === value);

  return (
    <div className={styles.selector}>
      <Selector
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        text={<QueryTextBold>{choice ? choice.label : '(unknown metric)'}</QueryTextBold>}
      >
        <ItemList
          choices={METRIC_CHOICES}
          onClick={choice => {
            onChange(choice.id as AnalyticsFocusedMetric);
            // Blur the element that was selected if there was a focused element
            if (document.activeElement) { (document.activeElement as HTMLElement).blur(); }
            setOpen(false);
          }}
        />
      </Selector>
      <span className={styles.label}>for</span>
    </div>
  );
};

export default AnalyticsFocusedMetricSelector;
