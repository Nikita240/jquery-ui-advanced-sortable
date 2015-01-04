/**
 * jQuery UI Advanced Sortable.
 *
 * jQuery UI widget that extends sortable functionality.
 * Main features: multiselect, animations
 *
 * https://github.com/Nikita240/jquery-ui-advanced-sortable
 *
 * @version  0.0.0
 * @author   Nikita Rushmanov @Nikita240
 * @license  MIT
 * @requires http://jqueryui.com/sortable/
 */

$.widget("ui.sortable", $.ui.sortable, {
	options: {
		animate: false,
		animationSpeed: 500,
		pointerVelocityThreshold: 0.5,
		multiselect: false,
		selectedClassName: "selected",
		placeholder: "ui-sortable-placeholder"
	},

	// default methods

	/**
	 * Override of ui.sortable _create method.
	 *
	 * Get's called on sortable initialization.
	 */
	_create: function() {

		var o = this.options;
		this.items_selector = o.items;

		//Initialize animation things
		if(o.animate)
		{
			this.animationCloneContainer = 
				$("<div>")
					.attr("class", this.element.attr("class"))
					.addClass("ui-sortable-animation-clone-container")
					.css("display", "none");
			
			//Add container to DOM.
			//The container has to be a child of the body
			//because item positions are calculated using the document offset.
			$("body").append(this.animationCloneContainer);

			//Animate requires the multiselect overriden methods to work
			o.multiselect = true;

			this.options.revert = false;
		}

		this._super();

		//Initialize multiselect things
		if(o.multiselect)
		{
			//Change default delay.
			//This makes it easier to select.
			if(o.delay === 0)
				this.options.delay = 150;

			//Bind select handlers
			this._bindSelectHandler();

			this.options.revert = false;
		}
	},

	// public methods


	// private methods

	/**
	 * Override of ui.sortable _mouseStart method.
	 *
	 * If animated option is set to true, initiliazes animation
	 * clones.
	 */
	_mouseStart: function(event, overrideHandle, noActivation) {

		this._super(event, overrideHandle, noActivation);

		var o = this.options;

		//Initialize animations
		if(o.animate)
		{

			//Sync positions
			this._syncAnimationClonePositions();

			//Show clones
			this.animationCloneContainer.css("display", "");

			//Hide originals
			this.element.css("visibility", "hidden");
		}
	},

	/**
	 * Override of ui.sortable _mouseDrag method.
	 *
	 * If animated option is set to true, it will only call _super
	 * if the mouse velocity is below a threshold.
	 */
	_mouseDrag: function(event) {

		var o = this.options;

		if(!this.lastMouseDragEvent)
			this.lastMouseDragEvent = event;

		//calculate velocity
		this.v = Math.sqrt(
					Math.pow(this.lastMouseDragEvent.pageX-event.pageX, 2) 
					+ Math.pow(this.lastMouseDragEvent.pageY-event.pageY, 2)
				) / (event.timeStamp - this.lastMouseDragEvent.timeStamp);

		this.lastMouseDragEvent = event;
		
		this._super(event);
	},

	/**
	 * Override of ui.sortable _intersectsWithPointer method.
	 *
	 * If animations are on, it will prevent triggering
	 * of change unless the velocity threshold is met.
	 *
	 * Additionally, because of the velocity threshold, it is
	 * possible for the _super method to get the direction wrong,
	 * so this will attempt to calculate the direction using 
	 * element order, and if it fails, it will fallback to 
	 * the _super's return.
	 */
	_intersectsWithPointer: function(item) {

		if(this.v > this.options.pointerVelocityThreshold)
			return false;

		var intersection = this._super(item);

		//If the _super returned false, we return false too
		if(!intersection)
			return intersection;

		//We attempt to calculate our own intersection direction
		if(this.placeholder.prevAll().filter(item.item).length !== 0)
			intersection = 1;
		else if(this.placeholder.nextAll().filter(item.item).length !== 0)
			intersection = 2;

		//Prevent triggering rearrange if there isn't an item to swap with
		if(item.item.hasClass(this.options.placeholder) &&
			!item.item[intersection === 1 ? "prevAll" : "nextAll" ](".ui-sortable-handle").first().length)
			return false;

		return intersection;
	},

	/**
	 * Override of ui.sortable _refreshItems method.
	 *
	 * If animate option is set to true, it will refresh
	 * animation clones on refresh.
	 */
	_refreshItems: function(event) {

		this._super(event);

		if(this.options.animate)
			this._refreshAnimationClones(false);
	},
	
	/**
	 * Override of ui.sortable _createHelper method.
	 *
	 * If multiselect option is set to false, it will call the original
	 * _createHelper method. Otherwise it will create a helper div (block) that
	 * contains all the selected items.
	 *
	 * @param {Event} event Event that triggered this
	 *
	 * @return {Object} Returns jQuery object that represents the created
	 * helper.
	 */
	_createHelper: function(e) {

		var o = this.options;
		var that = this;

		//if multiselect is not enabled, use the default helper
		if(!o.multiselect)
			return this._super();

		//Cache current items position
		this._cacheMargins();
		this.offset = this.currentItem.offset();
		var offset_margin_delta = this._subtractVectors(this.offset, this.margins);

		//Create helper
		$helper = $("<div>")
			.css(offset_margin_delta)
			.css("position", "absolute")
			.append(
				$("<div>")
					.attr("class", this.element.attr("class"))
					.css("position", "relative")
			);

		//Add the helper to the DOM if that didn't happen already
		if(!$helper.parents("body").length)
		{
			$helper.appendTo("body");
			//$(o.appendTo !== "parent" ? o.appendTo : this.currentItem.parent()).first().append($helper);
		}

		//Basically, if you grab an unselected item to drag, it will deselect everything else
		//and only move the current item to the helper
		if(!this.currentItem.hasClass(o.selectedClassName))
		{
			$.each(this.items, function(indx, item_obj) {
				item_obj.item.removeClass(o.selectedClassName); });

			this.currentItem.addClass(o.selectedClassName);
		}

		//Create placeholders BEFORE we move the items
		this._createPlaceholder();

		//Move all selected items into the helper
		$.each(this.selected_items, function(indx, item_obj) {

			$helper.find("> div").append(item_obj.item);

			//Calculate original position vector
			var original_vector = that._subtractVectors(
				item_obj, 
				that.offset
			);

			//Move the item to it's "original" position
			//(this is done so that in the event animations are
			//enabled, they will move to a new position from where
			//they started instead of jumping)
			item_obj.item
				.css("position", "absolute")
				.css(original_vector);
		});

		//Position selected items to be in the same position as their placeholder
		this._syncHelperPositions();

		return $helper;
	},

	/**
	 * Override of ui.sortable _createPlaceholder method.
	 *
	 * If multiselect option is set to false, it will call the original
	 * _createPlaceholder method. Otherwise it will create placeholders
	 * for all the selected items.
	 *
	 * This method should be called before the items are moved into the 
	 * helper. It uses their positions as a reference to insert the placeholder.
	 *
	 * @param {Object} that
	 */
	_createPlaceholder: function(that) {

		var o = this.options;

		if(!o.multiselect)
			return this._super();

		var that = that || this;
		that.itemsAndPlaceholders = that.items;

		//_mouseStart() hides currentItem because it's different from the helper.
		//This compensates for that.
		that.currentItem.css("display", "");

		//Don't reclone placeholders if they already exist
		if(that.placeholders)
			return;
		
		var placeholders = [];
		this.selected_items = [];
		$.each(this.items, function(indx, item_obj) {

			//If this item has a "selected" class
			if(item_obj.item.hasClass(o.selectedClassName))
			{

				//Clone placeholder
				var placeholder_clone = item_obj.item.clone()
					.removeClass(o.selectedClassName+" ui-sortable-handle")
					.addClass(o.placeholder)
					.css("visibility", "hidden")
					.insertBefore(that.currentItem);

				//Add this item to this.selected_items
				//(clone first, or it will pass by reference)
				var item_obj_clone = $.extend(true, {}, item_obj);
				item_obj_clone.placeholder_ref = placeholder_clone;
				that.selected_items.push(item_obj_clone);

				//Mark current placeholder
				if(item_obj.item[0] == that.currentItem[0])
				{
					that.placeholder = placeholder_clone;

					//Clone an invisible "reference" placeholder that will be used
					//as a reference point for placeholder positions after the
					//current placeholder is moved by _rearrange().
					placeholders.push(
						placeholder_clone.clone()
							.addClass("ui-sortable-placeholder-reference")
							.css("display", "none")
							.insertAfter(placeholder_clone)
					);
				}
				//Mark all other placeholders
				else
				{
					placeholders.push(placeholder_clone);

					//Change this items reference to point to the placeholder clone
					//instead of the selected helper.
					//We do not do this for the currentItem to prevent triggering change
					//on the current placeholder.
					item_obj.item = placeholder_clone;
				}
			}
		});

		//Map array of placeholders to a jQuery selector object
		//http://stackoverflow.com/a/6867350/2449639
		that.placeholders = $(placeholders).map(function () {return this.toArray();} );
	},

	/**
	 * Override of ui.sortable _rearrange method.
	 *
	 * In multiselect mode, it rearranges the non-current
	 * placeholders after the default _rearrange() function
	 * rearranges the current placeholder.
	 *
	 * Additionally, if the rearrange is triggered by a 
	 * multiselect placeholder, it replaces the i.item
	 * with the next handle in the DOM.
	 */
	_rearrange: function(event, i, a, hardRefresh) {

		var o = this.options;
		var that = this;
		var triggeredByPlaceholder = false;

		//If the trigger item is a placeholder,
		//change the trigger item to the next/prev handle
		//before calling _super().
		if(o.multiselect && i.item.hasClass(o.placeholder))
		{
			i = $.extend(true, {}, i); //Clone i (original is passed by reference)
			i.item = i.item[this.direction === "up" ? "nextAll" : "prevAll"](".ui-sortable-handle").first();

			triggeredByPlaceholder = true;
		}

		this._super(event, i, a, hardRefresh);

		//Rearrange non-current placeholders
		if(o.multiselect)
		{

			//The item after the current placeholder that all
			//placeholders should be placed before.
			var nextItem = false;
			var after = false;
			this.placeholders.each(function() {

				//If we have reached the current placeholder original
				//position (the reference), then set the nextItem to 
				//start inserting after the current placeholder.
				if($(this).hasClass("ui-sortable-placeholder-reference"))
				{
					nextItem = that.placeholder.next();

					//Fallback, if there is no next item,
					//then just insert after the last sibling
					if(!nextItem.length)
						after = true;
				}


				if(after)
					that.placeholder.parent().children().last().after($(this));
				else if(nextItem)
					nextItem.before($(this));
				else
				{
					//Move the previous item after the current placeholder
					//every time a non-current placeholder is moved to before the 
					//current placeholder if we are moving down.
					if(that.direction === "down" && !triggeredByPlaceholder)
					{
						that.placeholder
							.prevAll(".ui-sortable-handle:not(."+o.selectedClassName+")")
							.first()
							.insertAfter(that.placeholder);
					}

					that.placeholder.before($(this));
				}
			});
		}

		this._syncAnimationClonePositions(true);
		this._syncHelperPositions();
	},

	/**
	 * Override of ui.sortable _clear method.
	 *
	 * In multiselect mode, it moves the non-current
	 * helpers before the placeholders and deletes the
	 * non-current placeholders before calling _super.
	 */
	_clear: function(event, noPropagation) {

		var o = this.options;
		var that = this;

		if(o.multiselect)
		{
			//Move selected items near the placeholders
			$.each(this.selected_items, function(indx, item_obj) {

				item_obj.item.insertBefore(that.placeholder);

				//Cleanup selected item css
				item_obj.item
					.css({
						position : "",
						top      : "",
						left     : ""
					});
			});

			//Remove non current placeholders
			this.placeholders.remove();
			this.placeholders = null;

			//Prevent _super from trying to move the placeholder again
			this._noFinalSort = true;
		}

		this._super(event, noPropagation);

		//Cleanup current item css
		this.currentItem.css({
			position : "",
			top      : "",
			left     : "",
			display  : ""
		});
	},	

	/**
	 * Subtracts position vector b from a.
	 *
	 * a - b
	 *
	 * Example of what a position vector object should look like:
	 * {
	 *     top: 100,
	 *     left: 50
	 * }
	 *
	 * This is equivalent to the objects returned with the jQuery functions
	 * position() and offset().
	 *
	 * @param {Object} a jQuery position vector object
	 * @param {Object} b jQuery position vector object
	 *
	 * @return {Object} Returns a - b
	 */
	_subtractVectors: function(a, b) {
		return {
			top: a.top - b.top,
			left: a.left - b.left
		};
	},

	/**
	 * Binds the click handlers for item selection.
	 *
	 * Ctrl clicks will single select and
	 * shift clicks will select a range of items.
	 * Single clicking will deselect all and select
	 * current.
	 */
	_bindSelectHandler: function() {

		var o = this.options;
		var that = this;

		$.each(this.items, function(indx, item_obj) {

			item_obj.item.click(function(e) {

				//temporary action
				$(this).toggleClass(o.selectedClassName);
			});
		});
	},
	
	/**
	 * Refreshes clones of sortable handles to be used for animation.
	 *
	 * The clones should be absolutely positioned and be invisible until 
	 * sorting starts.
	 */
	_refreshAnimationClones: function() {

		var that = this;
		var o = this.options;

		//Clean container
		this.animationCloneContainer.empty();
		
		//Clone items
		$.each(this.items, function(indx, item_obj) {
			
			//If this item has a "selected" class, do not clone
			if(item_obj.item.hasClass(o.selectedClassName))
				return;

			//Create clone
			var $clone = item_obj.item.clone()
				.removeClass("ui-sortable-handle")
				.addClass("ui-sortable-animation-clone")
				.css({
					position : "absolute",
					zIndex   : o.zIndex-1
				});

			//Store reference
			item_obj.animationClone = $clone;

			//Add to container
			that.animationCloneContainer.append($clone);
		});
	},

	/**
	 * Sets the top and left positions of the animation clones
	 * to match the current position of the items.
	 *
	 * @param bool animate Whether or not to animate the position change.
	 */
	_syncAnimationClonePositions: function(animate) {

		var that = this;
		var o = this.options;

		$.each(this.items, function(indx, item_obj) {
			
			if(!item_obj.animationClone)
				return;

			var margins = {
				left: (parseInt(item_obj.item.css("marginLeft"),10) || 0),
				top: (parseInt(item_obj.item.css("marginTop"),10) || 0)
			};
			var offset_margin_delta = that._subtractVectors(item_obj.item.offset(), margins);

			//Stop current clone animations
			item_obj.animationClone.stop(true, false);

			if(animate)
			{
				if(offset_margin_delta != item_obj.animationClone.position()) // only animate if the position has changed
					item_obj.animationClone.animate(offset_margin_delta, o.animationSpeed);
			}
			else
				item_obj.animationClone.css(offset_margin_delta);
		});
	},

	/**
	 * Sets the top and left positions of the helpers to be
	 * at the same vector relative to the current helper as 
	 * the placeholders.
	 * 
	 * Does animation if neccessary.
	 */
	_syncHelperPositions: function() {

		var that = this;
		var o = this.options;

		$.each(this.selected_items, function(indx, item_obj) {

			//Calculate the delta vector
			var delta_vector = that._subtractVectors(
				that.currentItem.position(),
				that._subtractVectors( 
					that.placeholder.offset(),
					item_obj.placeholder_ref.offset()
				)
			);

			//Position the item to be in the same position as the placeholder
			if(o.animate)
			{
				if(delta_vector != item_obj.item.position()) //Only animate if the position has changed
				{
					//Stop current animations
					item_obj.item.stop(true, false);

					item_obj.item.animate(delta_vector, o.animationSpeed);
				}
			}
			else
				item_obj.item.css(delta_vector);
		});
	}

});
