# AnalyticsPopup

A not too bad implementation of a target that can be clicked which opens up a popup above the page.
It also renders a backdrop that when clicked will dismiss the popup. Finally, the proper focus
logic exists so that when a user tabs onto the popup "target" the popup will be opened, and when the
tab focus leaves the popup, it will be closed.

NOTE: The big limitation with this popup is that nothing higher in the tree than the popup itself
can have `overflow: hidden`. I originally tried to position the backdrop and popup in a portal which
would avoid this, but it was too difficult to figure out and it required a lot of manual
book-keeping of the popup's position. Maybe this technique culd be used in the future though?
