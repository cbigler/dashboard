# SpaceCard

This presentational component displays an overview of a space.

## Component Props
- `space: CoreSpace` - The space to display.
- `events: [DensityEvent]` - An array of events that have occured for this space. Displayed on the
  real time event graph.
- `onClickRealtimeChartFullScreen: () => any` - A callback called when the full screen icon in the
  corner of the space card is clicked.
- `onClickEditCount: () => any` - A callback called when the edit count link on the space card is
  clicked.
