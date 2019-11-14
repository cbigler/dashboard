export const EXPLORE_DATA_CALCULATE_DATA_COMPLETE = 'EXPLORE_DATA_CALCULATE_DATA_COMPLETE';

export default function exploreDataCalculateDataComplete(calculation, data) {
  return {
    type: EXPLORE_DATA_CALCULATE_DATA_COMPLETE,
    calculation, /* ie, "dailyMetrics" */
    data,
  };
}
