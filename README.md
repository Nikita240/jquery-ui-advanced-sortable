#WORK IN PROGRESS

###Todo
- [ ] Ctrl-Z and History
- [ ] Automatic indexing
- [X] Ctrl, shift and mouse click selection
- [ ] Select and deselect callable methods
- [ ] Multiselect option to disable default selection handlers
- [ ] Multiselect modes where you can single click and drag select
- [ ] Soft snap to grid when near drop point

###Issues
- [X] placeholders sometimes don't trigger the change
- [X] when dragging from a non-first selected item,
the placeholders end up out of order
- [X] placeholders insert themselves in wrong positions
during _rearrange()
- [X] _rearrange throws exception or gets stuck in a loop when
triggered by a placeholder that doesn't have an item before or after it
- [X] FIREFOX IS FUCKED, MASSIVE LAG
- [ ] touch screen sorting doesn't work if animated or multiselect is true.
Issue only occurs in Chrome. It's also different on Ubuntu and Windows.
See https://github.com/furf/jquery-ui-touch-punch/issues/212

###Needs testing
- [X] Sorting blocks
- [X] Revert option
- [ ] Browsers other than Ubuntu-Chromium (lol)
	- [X] Firefox
	- [ ] IE10-11 (sigh...)
	- [ ] IE8 *kills self*
	- [ ] Safari
	- [ ] Android chrome
	- [ ] iOS Safari
	- [ ] Chrome on MacOS and Windows 8
- [X] multisort without animated
- [X] animated without multisort
- [X] different tolerances

==========

if multiselect is true, 
helper option is disabled, 
delay default is changed to 150

if animated is true,
revert default is changed to equal animate

options:

- animate (default=false) (set to 500 if true)
- multiselect (default=false)
- selectedClassName (default=selected)
- pointerVelocityThreshold (default=0.35)

Latest version of jquery-ui tested for compatability: 1.11.2

To enable touch screen compatability use https://github.com/furf/jquery-ui-touch-punch

Something something about wrapping inline-blocks, see http://stackoverflow.com/a/5078297/2449639
