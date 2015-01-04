#WORK IN PROGRESS

###Todo
- [X] move helpers into order on sort start
- [X] animate start
- [X] animate helper change
- [X] animated placeholder change
- [ ] drop when animating

###Issues
- [X] placeholders sometimes don't trigger the change
- [X] when dragging from a non-first selected item,
the placeholders end up out of order
- [X] placeholders insert themselves in wrong positions
during _rearrange()
- [ ] _rearrange throws exception or gets stuck in a loop when
triggered by a placeholder that doesn't have an item before or after it

###Needs testing
- [ ] Sorting blocks
- [ ] Revert option
- [ ] Browsers other than Ubuntu-Chromium (lol)

###Future Features
- [ ] Ctrl-Z
- [ ] Automatic indexing
- [ ] Ctrl, shift and mouse click selection
- [ ] Mouse drag selection (if possible)
- [ ] Soft snap to grid when near drop point
- [ ] Multiselect modes for touch screen devices

==========

if multiselect is true, 
helper option is disabled, 
delay default is changed to 150

revert option doesn't work for multisort OR animated

options:

- animated (default=false)
- multisort (default=false)
- selectedClassName (default=selected)
- animationSpeed (default=500)
- pointerVelocityThreshold (default=0.5)

Latest version of jquery-ui known to be compatable: 1.11.2

To enable touch screen compatability use https://github.com/furf/jquery-ui-touch-punch

Something something about wrapping inline-blocks, see http://stackoverflow.com/a/5078297/2449639
