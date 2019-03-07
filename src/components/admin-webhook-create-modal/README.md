# WebhookCreateModal

A form used to create webhooks. It's stateful and contains the intermediate values of the webhook.

## Component Props
- `loading: bool` - Is the collection currently in a loading state (ie, a request has been sent to
  the server to create a webhook?)
- `error: Error | null` - An error in the given collection (ie, a response from the server contained
  an error)
- `initialWebhook: DensityWebhook` - Initial webhook to populate the state with.
- `onSubmit: ({name, desc, endpoint}) => any` - When the user clicks the submit button, fire this
  callback to send the new webhook to the server (not in this component).
