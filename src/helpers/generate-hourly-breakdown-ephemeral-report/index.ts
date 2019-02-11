export default function generateHourlyBreakdownEphemeralReport(space, startDate, endDate, metric, title) {
  return {
    id: `rpt_${space.id}`,
    type: 'HOURLY_BREAKDOWN',
    name: title,
    settings: {
      spaceId: space.id,
      metric: metric,
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
