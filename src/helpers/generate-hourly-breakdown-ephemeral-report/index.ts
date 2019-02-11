export function generateHourlyBreakdownEphemeralReport(space, startDate, endDate) {
  return {
    id: `rpt_${space.id}`,
    type: 'HOURLY_BREAKDOWN',
    name: 'Hourly Breakdown',
    settings: {
      spaceId: space.id,
      timeRange: {
        type: 'CUSTOM_RANGE',
        startDate,
        endDate,
      },
      includeWeekends: true,
      hourStart: 6,
      hourEnd: 20
    },
  };
}
