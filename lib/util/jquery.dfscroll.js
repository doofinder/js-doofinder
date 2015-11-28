/**
 * Created by Kike Coslado on 16/11/15.
 */

module.exports = (function($){
   'use strict';
    $.dfScroll = function(container, o){
        $(container).css("position", "relative");
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
                }, 250);
            };
            obj.on(type, func);
            obj.trigger(name);
        };
        throttle('scroll', 'df:scroll', $(container));
        // Set default options
        o = $.extend(true, o, $.dfScroll.defaultOptions);
        // handling scroll event
        container.on('df:scroll', function () {
            var content = container.children().first();
            //When bottom or right side is about to be reached, callback will be called
            if (['horizontal', 'vertical'].indexOf(o.direction) <= -1){
                throw Error("Direction is not properly set. It might be 'horizontal' or 'vertical'.")
            }

            if ((o.direction == "vertical" &&
                    content.height() - container.height() + content.position().top <= o.scrollOffset) ||
                (o.direction == "horizontal" &&
                    content.width() - container.width() + content.position().left <= o.scrollOffset))
            {
                o.callback();
            }

        });
    };

    $.dfScroll.defaultOptions = {
        scrollOffset: 50,
        direction: 'vertical'
    };

    $.fn.dfScroll = function (o) {
        return this.each(function(){
            (new $.dfScroll($(this), o));
        });
    }
});