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

		this._super();

		//Initialize multiselect things
		if(o.multiselect)
		{
			//Change default delay.
			//This makes it easier to select.
			if(o.delay == 0)
				this.options.delay = 150;

			//Bind select handlers
			this._bindSelectHandler();

			this.options.revert = false;
		}

		//Initialize animation things
		if(o.animate)
		{
			this._createAnimationClones();

			//Animate requires the multiselect overriden methods to work
			o.multiselect = true;

			this.options.revert = false;
		}
	},

	// public methods



	// private methods
	
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

		//if multisort is not enabled, use the default helper
		if(!o.multiselect)
			return this._super();

		//Cache current items position
		this._cacheMargins();
		this.offset = this.currentItem.offset();
		var offset_margin_delta = this._subtractVectors(this.offset, this.margins);

		//Create helper
		$helper = $("<div>")
			.css({
				position: "absolute",
				top     : offset_margin_delta.top,
				left    : offset_margin_delta.left
			})
			.append($("<div>").css("position", "relative"));

		//Add the helper to the DOM if that didn't happen already
		if(!$helper.parents("body").length)
			$(o.appendTo !== "parent" ? o.appendTo : this.currentItem.parent()).first().prepend($helper);

		//Basically, if you grab an unselected item to drag, it will deselect everything else
		//and only move the current item to the helper
		if(!this.currentItem.hasClass(o.selectedClassName))
		{
			$.each(this.items, function(indx, item_obj) {
				item_obj.item.removeClass(o.selectedClassName); });

			this.currentItem.addClass(o.selectedClassName);
		}

		//Create array of selected items
		this.selected_items = [];	
		$.each(this.items, function(indx, item_obj) {
			if(item_obj.item.hasClass(o.selectedClassName))
				that.selected_items.push(item_obj);
		});

		//Create placeholders BEFORE we move the items
		this._createPlaceholder();

		//Move all selected items into the helper		
		$.each(this.selected_items, function(indx, item_obj) {

			$helper.find("> div").append(item_obj.item);

			//Calculate the original delta vector
			var delta_vector = that._subtractVectors(
				{
					top  : item_obj.top,
					left : item_obj.left
				}, 
				that.offset
			);

			//Position the item to be in the same position as before
			//it was moved.
			item_obj.item.css({
				position : "absolute",
				top      : delta_vector.top,
				left     : delta_vector.left
			});
		});

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

		//_mouseStart() hides currentItem because it's different from the helper.
		//This compensates for that.
		that.currentItem.css("display", "");

		//Don't reclone placeholders if they already exist
		if(that.placeholders)
			return;
		
		var placeholders = [];
		$.each(this.selected_items, function(indx, item_obj) {

			var placeholder_clone = item_obj.item.clone()
				.removeClass(o.selectedClassName+" ui-sortable-handle")
				.addClass(o.placeholder)
				.css("visibility", "hidden")
				.insertBefore(item_obj.item);

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
				placeholders.push(placeholder_clone);
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
	 */
	_rearrange: function(event, i, a, hardRefresh) {

		this._super(event, i, a, hardRefresh);

		var o = this.options;
		var that = this;

		//Rearrange non-current placeholders
		if(o.multiselect)
		{

			//The item after the current placeholder that all
			//placeholders should be placed before.
			var nextItem = false;
			this.placeholders.each(function() {

				//If we have reached the current placeholder original
				//position (the reference), then set the nextItem to 
				//start inserting after the current placeholder.
				if($(this).hasClass("ui-sortable-placeholder-reference"))
					nextItem = that.placeholder.next();

				if(nextItem)
					nextItem.before($(this));
				else
					that.placeholder.before($(this));
			});
		}
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
	 * Creates clones of sortable handles to be used for animation.
	 *
	 * The clones should be absolutely positioned and be invisible until 
	 * sorting starts.
	 */
	_createAnimationClones: function() {

		//Create container for clones.
		var $container = $("<div>").addClass("ui-sortable-animation-clone-container")
		
		//Clone items
		$.each(this.items, function(indx, item_obj) {
			
			//Create clone
			var $clone = item_obj.item.clone()
				.removeClass("ui-sortable-handle")
				.addClass("ui-sortable-animation-clone")
				.css({
					position  : "absolute",
					visibility: "hidden"
				});

			//Store reference
			item_obj.animationClone = $clone;

			//Add to container
			$container.append($clone);
		});

		//Add container to DOM.
		//The container has to be a child of the body
		//because item positions are calculated using the document offset.
		$("body").append($container);
	},

	/**
	 * Sets the top and left positions of the animation clones
	 * to match the current position of the items.
	 */
	_syncAnimationClonePositions: function() {

		$.each(this.items, function(indx, item_obj) {
			
			item_obj.animationClone.css({
				top  : item_obj.top,
				left : item_obj.left
			});
		});
	}
});
