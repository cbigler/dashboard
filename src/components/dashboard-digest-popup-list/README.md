# DashboardDigestList

A list of all digestes associated with a dashboard.

This is rendered in the app bar above the dashboard view and when clicked pops open to list out all
digestes associated with the given dashboard. Users can either edit an existing digest of create
a new one.

## Component Props
- `digestes: [DensityDigest]` - A list of digestes to render in the dropdown menu.
- `onCreateDigest: () => any` - Callback that is fired when the user clicks `Create a Digest`.
- `onEditDigest: (DensityDigest) => any` - Callback fired when the user clicks edit next to a digest.
