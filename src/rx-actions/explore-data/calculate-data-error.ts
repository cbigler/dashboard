export const EXPLORE_DATA_CALCULATE_DATA_ERROR = 'EXPLORE_DATA_CALCULATE_DATA_ERROR';

export default function exploreDataCalculateDataError(calculation, error) {
  return {
    type: EXPLORE_DATA_CALCULATE_DATA_ERROR,
    calculation, /* ie, "dailyMetrics" */
    error,
  };
}
