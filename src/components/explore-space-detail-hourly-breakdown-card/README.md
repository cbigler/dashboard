# HourlyBreakdownCard

This component renders the hourly breakdown card showing either Peak Occupancy per hour or Visits per hour.

## Component Props
- `space: DensitySpace` - The space that the events should be filtered by when the request to the
  server is made.
- `startDate: Date` - the start date, duh
- `endDate: Date` - the start date, duh
- `metric: String` - either `PEAKS` or `VISITS`
- `title: String` - the title of the report