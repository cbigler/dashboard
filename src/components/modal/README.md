# Modal

This component renders a backdrop and a modal dialog in a portal, so that both float above all other content. 

## Component Props

- `visible: boolean` - Should be set to true/false separately from mount/unmount, so the modal has time to animate.
- `width: string | number` - OPTIONAL: Width of the modal (default: auto, but see code for surprising use of max-width)
- `height: string | number` - OPTIONAL: Height of the modal (default: auto)
- `children: any` - Children to render inside the modal.
- `onEscape: handler` - OPTIONAL: What to do when a user presses the escape key.
- `onBlur: handler` - OPTIONAL: What to do when a user clicks outside the modal.
