import React from 'react';
import classNames from 'classnames';

import { AnalyticsFocusedMetric } from '../../types/analytics';
import formatMetricName from '../../helpers/analytics-formatters/metric-name';

import styles from './styles.module.scss';

const AnalyticsMetricSelector: React.FunctionComponent<{
  selectedMetric: AnalyticsFocusedMetric,
  onChange: (metric: AnalyticsFocusedMetric) => void,
}> = function ({ selectedMetric, onChange }) {
  return (
    <div className={styles.metricSelectorButtonGroup}>
      {[
        AnalyticsFocusedMetric.ENTRANCES,
        AnalyticsFocusedMetric.MAX,
        AnalyticsFocusedMetric.UTILIZATION,
      ].map(metric => (
        <div
          key={metric}
          className={classNames(
            styles.metricSelectorButton,
            { [styles.active]: selectedMetric === metric },
          )}
          onClick={() => onChange(metric)}
        >
          {formatMetricName(metric)}
        </div>
      ))}
    </div>
  )
}

export default AnalyticsMetricSelector;