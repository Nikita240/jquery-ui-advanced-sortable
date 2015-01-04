#WORK IN PROGRESS

###Todo
- [X] move helpers into order on sort start
- [X] animate start
- [X] animate helper change
- [X] animated placeholder change
- [X] drop when animating
- [X] fix revert
- [X] make animate work without multiselect

###Issues
- [X] placeholders sometimes don't trigger the change
- [X] when dragging from a non-first selected item,
the placeholders end up out of order
- [X] placeholders insert themselves in wrong positions
during _rearrange()
- [X] _rearrange throws exception or gets stuck in a loop when
triggered by a placeholder that doesn't have an item before or after it

###Needs testing
- [ ] Sorting blocks
- [X] Revert option
- [ ] Browsers other than Ubuntu-Chromium (lol)
- [X] multisort without animated
- [X] animated without multisort
- [X] different tolerances

###Future Features
- [ ] Ctrl-Z
- [ ] Automatic indexing
- [ ] Ctrl, shift and mouse click selection
- [ ] Mouse drag selection (if possible)
- [ ] Soft snap to grid when near drop point
- [ ] Multiselect modes for touch screen devices
- [ ] Hover time threshold (difficult, put in backburner)

==========

if multiselect is true, 
helper option is disabled, 
delay default is changed to 150

if animated is true,
revert default is changed to equal animate

options:

- animate (default=false) (set to 500 if true)
- multisort (default=false)
- selectedClassName (default=selected)
- pointerVelocityThreshold (default=0.35)

Latest version of jquery-ui tested to be compatable: 1.11.2

To enable touch screen compatability use https://github.com/furf/jquery-ui-touch-punch

Something something about wrapping inline-blocks, see http://stackoverflow.com/a/5078297/2449639
