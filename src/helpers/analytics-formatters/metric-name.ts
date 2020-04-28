import { AnalyticsFocusedMetric } from '../../types/analytics';


function assertNever(arg: never) {};

export default function formatMetricName(metric: AnalyticsFocusedMetric) {
  switch (metric) {
    case AnalyticsFocusedMetric.MAX:
      return 'Occupancy';
    case AnalyticsFocusedMetric.UTILIZATION:
      return 'Utilization';
    case AnalyticsFocusedMetric.ENTRANCES:
      return 'Entrances';
    case AnalyticsFocusedMetric.EXITS:
      return 'Exits';
    case AnalyticsFocusedMetric.EVENTS:
      return 'Events';
    case AnalyticsFocusedMetric.OPPORTUNITY:
      return 'Available Capacity';
    case AnalyticsFocusedMetric.VENT_CUBIC_FEET_PER_MINUTE:
      return 'Cu. Ft. / Minute';
    case AnalyticsFocusedMetric.VENT_WATTS_PER_HOUR:
      return 'Vent. Watts / Hour';
    case AnalyticsFocusedMetric.VENT_ENERGY_MONTHLY_COST:
      return 'Energy Cost / Month';
  }
  // if we change the enum members for AnalyticsFocusedMetric this will error if not all cases are handled
  assertNever(metric);
}

export type FormattedMetricName = ReturnType<typeof formatMetricName>;
