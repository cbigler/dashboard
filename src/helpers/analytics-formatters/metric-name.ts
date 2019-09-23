import { AnalyticsFocusedMetric } from '../../types/analytics';


export default function formatMetricName(metric: AnalyticsFocusedMetric) {
  switch (metric) {
    case AnalyticsFocusedMetric.ENTRANCES:
      return 'Visits';
    case AnalyticsFocusedMetric.MAX:
      return 'Occupancy';
    case AnalyticsFocusedMetric.UTILIZATION:
      return 'Utilization';
  }
}
