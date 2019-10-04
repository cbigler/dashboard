export const EXPLORE_DATA_CALCULATE_DATA_LOADING = 'EXPLORE_DATA_CALCULATE_DATA_LOADING';

export default function exploreDataCalculateDataLoading(calculation, data=null) {
  return {
    type: EXPLORE_DATA_CALCULATE_DATA_LOADING,
    calculation, /* ie, "dailyMetrics" */
    data,
  };
}
