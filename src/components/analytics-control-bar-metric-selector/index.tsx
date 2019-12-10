import React, { useState, useContext } from 'react';

import { AnalyticsFocusedMetric } from '../../types/analytics';
import Selector, { QueryTextBold } from '../analytics-control-bar-selector';
import { ItemList } from '../analytics-control-bar-utilities';

import styles from './styles.module.scss';
import formatMetricName from '../../helpers/analytics-formatters/metric-name';
import { AnalyticsFeatureFlagsContext } from '../../helpers/analytics-feature-flags';


function getLabelForMetricChoice(metric: AnalyticsFocusedMetric) {
  switch (metric) {
    case AnalyticsFocusedMetric.OPPORTUNITY:
      return <span>Available Capacity <span className={styles.metricSelectionBetaTag}>BETA</span></span>
    default:
      return formatMetricName(metric);
  }
}

const ALL_METRIC_CHOICES = [
  AnalyticsFocusedMetric.MAX,
  AnalyticsFocusedMetric.UTILIZATION,
  AnalyticsFocusedMetric.OPPORTUNITY,
  AnalyticsFocusedMetric.ENTRANCES,
  AnalyticsFocusedMetric.EXITS,
].map(metric => {
  return {
    id: metric,
    label: getLabelForMetricChoice(metric),
  }
});

type AnalyticsFocusedMetricSelectorProps = {
  value: AnalyticsFocusedMetric,
  onChange: (choiceId: AnalyticsFocusedMetric) => void,
}

const AnalyticsFocusedMetricSelector: React.FunctionComponent<AnalyticsFocusedMetricSelectorProps> = function AnalyticsFocusedMetricSelector({ value, onChange }) {
  const [ open, setOpen ] = useState(false);

  const { opportunityMetricEnabled } = useContext(AnalyticsFeatureFlagsContext);

  const metricChoices = opportunityMetricEnabled ? ALL_METRIC_CHOICES : ALL_METRIC_CHOICES.filter(c => c.id !== AnalyticsFocusedMetric.OPPORTUNITY);

  const choice = metricChoices.find(choice => choice.id === value);

  return (
    <div className={styles.selector}>
      <Selector
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        text={<QueryTextBold>{choice ? choice.label : '(unknown metric)'}</QueryTextBold>}
      >
        <ItemList
          choices={metricChoices}
          onClick={choice => {
            onChange(choice.id as AnalyticsFocusedMetric);
            // Blur the element that was selected if there was a focused element
            if (document.activeElement) { (document.activeElement as HTMLElement).blur(); }
            setOpen(false);
          }}
        />
      </Selector>
    </div>
  );
};

export default AnalyticsFocusedMetricSelector;
