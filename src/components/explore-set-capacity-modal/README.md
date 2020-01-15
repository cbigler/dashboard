# ExploreSetCapacityModal

A modal that allows the user to change the capacity of a space.

This modal is opened when the user clicks the "Set capacity" link on the explore list page for a
space. It is a stateful component, but its only state is the capacity that is being entered.

## Component Props
- `space: CoreSpace` - The space that the capacity is being set on.
- `onDismiss: () => any`: A callback that is called when the modal is dismissed.
- `onSubmit: (count) => any`: A callback that is called when the modal is submitted. The capacity
  that was chosen is passed.
- `loading: bool`: Should the modal show a loading state?
