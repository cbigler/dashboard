# Report
A component for rendering reports from density ui, given a report configuration from the core api
and calculated report data.

## Component Props
- `report: DensityReport` - Report data received from the core api's GET /reports/ or GET
  /reports/:id endpoints.
- `reportData: any` - Report calculation results required to render a report - this changes
  depending on the report.
- `expanded: bool` - Should the report render in an expanded state?
