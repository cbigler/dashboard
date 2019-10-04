export const EXPLORE_DATA_ADD_CALCULATION = 'EXPLORE_DATA_ADD_CALCULATION';

export default function exploreDataAddCalculation(calculation) {
  return {
    type: EXPLORE_DATA_ADD_CALCULATION,
    calculation, /* ie, "dailyMetrics" */
  };
}
