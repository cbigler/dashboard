# DashboardDispatchList

A list of all dispatches associated with a dashboard.

This is rendered in the app bar above the dashboard view and when clicked pops open to list out all
dispatches associated with the given dashboard. Users can either edit an existing dispatch of create
a new one.

## Component Props
- `dispatches: [DensityDispatch]` - A list of dispatches to render in the dropdown menu.
- `onCreateDispatch: () => any` - Callback that is fired when the user clicks `Create a Dispatch`.
- `onEditDispatch: (DensityDispatch) => any` - Callback fired when the user clicks edit next to a dispatch.
