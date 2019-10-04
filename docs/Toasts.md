# Toasts

A Toast is a small popup at the top of the screen that we typically use to show status updates of a
task in progress, or to display sucess or error messages after a task completes.

![https://i.imgur.com/mCrzmVt.png](https://i.imgur.com/mCrzmVt.png)

### Displaying Toasts
The dashboard has a helper that can be used to show a toast. This is preferred to just rendering the
toast directly in a component as then the state about which toasts are visible is stored in a single
place, we don't have to worry about two different "toast sources" displaying overlapping toasts, the
animations can be properly orchestrated by the helpers, etc.

To show a toast, dispatch the `showToast` action:
```javascript
import { showToast } from './src/rx-actions/toasts';

showToast(dispatch, {
  type: 'default', // Or 'error' to render an error toast
  text: 'Text inside of toast',
  title: 'Optional toast title',

  // Optional toast id, this is used when hiding the toast. If not specified, a uuid is generated
  // for you.
  id: 'toast id',

  // Optional amount of time for the toast to be visible in milliseconds before it is dismissed, or
  // null for it to always be visible.
  timeout: 2000,
});
```

To hide a toast, dispatch the `hideToast` action:
```javascript
import { hideToast } from './src/rx-actions/toasts';

// NOTE: for a toast to be hidden, the toast id needs to be specified manually when showing the
// toast!
const id = 'toast id'; // From the last example

hideToast(dispatch, id);
```
