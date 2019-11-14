# Dialogger

This component makes it easy to show modal dialogs that perform simple actions. To use, include the `<Dialogger />` component in your page, and show modals according to the following convention:

```
showModal(dispatch, 'MODAL_CONFIRM', {
  prompt: 'Are you sure you want to delete this user?',
  confirmText: 'Delete',
  callback: () => dispatch(collectionUsersDestroy(user))
}));
```
