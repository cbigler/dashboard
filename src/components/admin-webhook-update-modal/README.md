# WebhookUpdateModal

A modal used for updating the metadata associated with a webhook. It's a stateful component that
contains the content of the update form. In addition, it can turn into a confirm box to destroy a
webhook.

## Component Props
- `loading: bool` - Is the collection currently in a loading state (ie, a request has been sent to
  the server to update a webhook?)
- `error: Error | null` - An error in the given collection (ie, a response from the server contained
  an error)
- `onSubmit: ({name, desc}) => any` - Callback that is called when the webhook is updated.
- `onDismiss: () => any` - Callback that is called when the modal is dismissed.
- `onDestroyWebhook: (id) => any` - Callback that is called when a webhook is destroyed.
