# DashboardDispatchManagementModal

This component renders a modal that can be used to create a new dispatch or modify an existing
dispatch for a dashboard.

## Component Props
- `visible: boolean` - Should the modal be rendered?
- `onCloseModal: () => any` - A callback that when called should hide the modal.
- `dispatch: DensityDispatch | undefined` - Dispatch to modify. If `null`, will create a new dispatch.
