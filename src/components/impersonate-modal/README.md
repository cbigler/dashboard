# ImpersonateModal

Renders a modal for managing user impersonation. Data is initialized and copied into `activeModal.data` when the modal is shown, and back into `state.impersonate` reducer when the "Save" button is clicked.

### Hiding the impersonation Org
A user can hide the chosen org to impersonate by enabling the "Hide Organization" checkbox. This hides the Org in the Navbar but keeps the impersonation icon, to ensure a user still knows when they're in an active impersonation state.
