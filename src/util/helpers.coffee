extend = require "extend"

module.exports =
  addTranslateHelper: (context, translations = {}) ->
    ###*
     * Mustache helper to translate strings given a translations object in the
     * global context object. If no translation is found, the source text is
     * returned.
    ###
    extend true, context, "translate": ->
      (text, render) ->
        text = render text
        translations[text] or text
