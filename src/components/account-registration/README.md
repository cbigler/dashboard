# AccountRegistration

This component contains the account registration form. The form is used to prompt for info to create
an account, such as full name. It's a stateful component that holds the state of all
the form fields, and is the "page component" for the account registration page.

Behind the scenes, the router dispatches an action to signify that the user went to the account
registration page, which contains a url-safe base64 encoded invitation token payload. In the
`account-registration` reducer, we then store the registration information from the url.

## Component Props
(none, connected)
