# Active Modal

This reducer represents the currently visible modal on the page.

Consider this common pattern. First, a user clicks on a button and opens a popup or toast. Then, the
user interacts with this visible, modally positioned element. Finally, the user completes their
interaction with the element and the modally positioned element is hidden.

This is exactly the workflow this reducer enables.

When the developer wants to make a modal visible, they dispatch a `SHOW_MODAL` action, passing a
`name` key in the action to indicate the modal to be shown. Then, after this modal is done, the
developer can dispatch a `HIDE_MODAL` action to clear the state of the currently visible modal and
return the user back to the application.

There's one more situation that this reducer takes into account. Let's say that you, the developer,
have a generic modal that you want to show with dynamic data. A good example of this in practice is
the doorway detail modals on the environment page - a modal needs to be passed an instance of a
doorway to display and allow the user to optionally edit. To help facilitate this, the `SHOW_MODAL`
action also takes an optional `data` key that can be referenced by the modal to display dynamic data
(in the previous example, the `data` key contains the doorway info to display in the modal)

### Assumptions
- Only one modal will be visible on the screen at a time.
- Multiple depths of modals don't fit in this abstraction.
