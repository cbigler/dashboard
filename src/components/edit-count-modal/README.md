# VisualizationSpaceDetailSpaceUpdateModal

Renders a modal used to update or reset the count of a space. It's a stateful component since it
contains the intermediate values of the modal prior to their submission to the server.


## Component Props
- `space: CoreSpace`: The space to update the count of in the modal.
- `onDismiss: () => any`: A callback that is called when the modal is dismissed.
- `onSubmit: (count) => any`: A callback that is called when the modal is submitted. The count that
  was chosen is passed.
- `loading: bool`: Should the modal show a loading state?
