export default function generateHourlyBreakdownEphemeralReport(space, startDate, endDate, metric, title, aggregation) {
  return {
    id: `rpt_${space.id}`,
    type: 'HOURLY_BREAKDOWN',
    name: title,
    settings: {
      spaceId: space.id,
      scrollable: true,
      metric: metric,
      aggregation: aggregation,
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
