# IntegrationsRobinCreateModal

A form used to create a Robin Integration. It's stateful and contains the intermediate values of the webhook.

## Component Props
- `loading: bool` - Is the collection currently in a loading state (ie, a request has been sent to
  the server to create a robin integration)
- `error: Error | null` - An error in the given collection (ie, a response from the server contained
  an error)
- `onSubmit: ({robin_access_token, robin_organization_id}) => any` - User sumbitted the robin integration creation form.
- `onDismiss: () => any` - User dismissed the modal.
