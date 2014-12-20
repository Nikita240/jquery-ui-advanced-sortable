#WORK IN PROGRESS

###Todo
- [ ] move helpers into order on sort start
- [ ] animate start
- [ ] animate helper change
- [ ] animated placeholder change

###Issues
- [ ] placeholders sometimes don't trigger the change
- [ ] when dragging from a non-first selected item,
the placeholders end up out of order

###Needs testing
- [ ] Sorting blocks
- [ ] Revert option

###Future Features
- [ ] Ctrl-Z
- [ ] Automatic indexing
- [ ] Ctrl, shift and mouse click selection
- [ ] Mouse drag selection (if possible)
- [ ] Soft snap to grid when near drop point

==========

if multiselect is true, 
helper option is disabled, 
delay default is changed to 150

revert option doesn't work for multisort OR animated

options:

- animated (default=false)
- multisort (default=false)
- selectedClassName (default=selected)

Latest version of jquery-ui known to be compatable: 1.11.2

To enable touch screen compatability use https://github.com/furf/jquery-ui-touch-punch
