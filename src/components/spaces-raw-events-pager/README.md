# VisualizationSpaceDetailRawEventsPager

A component that renders a pager below the raw events card on the visualization space detail page.
It's a stateful component that emits data via `onChange` when the user is finished entering data.

Let me define 'finished entering data'. Sicne the data is numerical, the input box could be at any
number of states before the user is done entering the data - ie, empty or an invalid number. We wait
for the input to blur before emitting the changed value to get around this limitation.

## Component Props
- `page: number` - The current page.
- `totalPages: number` - The total number of pages that that data fits into.
- `totalEvents: number` - The total number of events that the data contains.
- `onChange: (newPage) => any` - Emit the new page number when the data is finished being entered.
