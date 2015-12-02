/**
 * Created by Kike Coslado on 16/11/15.
 */

module.exports = (function($){
   'use strict';
    function Plugin(element, options) {
    	this.$el = $(element);
    	this._name = 'dfScroll';
    	this.$el.css("position", "relative");
        this.$content = this.$el.children().first();
        this.$content.css('overflow', 'hidden');
    	this.options = $.extend(
    		true, 
    		{
    			scrollOffset: 50,
        		direction: 'vertical'
    		}, options || {});
    	this.init();
    }


    Plugin.prototype = {
    	init: function(){
    		// Avoids multiple scroll triggers
	        var throttle = function (type, name, obj) {
	            var obj = obj || window;
	            var running = false;
	            var func = function () {
	                if (running) {
	                    return;
	                }
	                running = true;
	                setTimeout(function () {
	                    obj.trigger(name);
	                    running = false;
	                }, 5);
	            };
	            obj.on(type, func);
	            obj.trigger(name);
	        };
	        throttle('scroll', 'df:scroll', this.$el);

	        // handling scroll event
	        self = this;
	        this.$el.on('df:scroll', function () {
	        	var container = self.$el;
	        	var content = self.$content;
	            //When bottom or right side is about to be reached, callback will be called
	            if (['horizontal', 'vertical'].indexOf(self.options.direction) <= -1){
	                throw Error("Direction is not properly set. It might be 'horizontal' or 'vertical'.")
	            }
	            
	            if ((self.options.direction == "vertical" &&
	                    content.height() - container.height() + content.position().top <= self.options.scrollOffset) ||
	                (self.options.direction == "horizontal" &&
	                    content.width() - container.width() + content.position().left <= self.options.scrollOffset)){ 
	                self.options.callback();
	            }

	        });

       }
    };

    $.fn.dfScroll = function (o) {

        return this.each(function(){
        	var $this = $(this), data = $this.data('dfScroll');
    		if (!data) $this.data('dfScroll', (data = new Plugin($(this), o)));
        });
    }
});