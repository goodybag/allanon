// just going to put my commit comment in for now.  TODO: clean up later.

## New componentized version of explore/explore-collection header

It allows you to set the title, button classes and names, and the type of button
toggle, radio or checkbox.  It defaults to checkbox.  It also handles the
button toggle and search user interaction events.

When the user triggers a search by clicking the search button or by typing in
the search field, the component handles aborting the form submission and
toggling the clear search button.  It then triggers a 'search' event on the
component containing the current value of the search input.  This event is
debounced to 666ms so it only triggers after the user stops typing.

The component also watches click events on the buttons, triggering toggle
events on itself when the click results in a button state change.  There is a
'toggle' event when any button state changes, containing an array of hashes,
each hash pairs the class name of the button with its new state.  The component
also triggers individual 'toggle:[class name]' events for each change.