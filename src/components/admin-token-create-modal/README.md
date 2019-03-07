# TokenCreateModal

A modal that allows the user to create a new token. It has fields for token name, description,
and permission level. It's stateful and holds the intermediate values for the token name,
description, and more until they are sent to the server.

## Component Props
- `loading: bool` - Is the collection currently in a loading state (ie, a request has been sent to
  the server to create a token?)
- `error: Error | null` - An error in the given collection (ie, a response from the server contained
  an error)
- `onSubmit: ({name, description, tokenType}) => any` - User sumbitted the token creation form.
- `onDismiss: () => any` - User dismissed the modal.
