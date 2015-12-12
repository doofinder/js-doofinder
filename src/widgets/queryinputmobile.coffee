###
queryinput.coffee
author: @ecoslado
2015 11 21
###

$ = require '../util/jquery'
QueryInput = require './queryinput'

###
QueryInput

This class gets the query and
calls controller's search method.
Gets the string from an input when
receives more than given number of
characters (3 by default).
###

class QueryInputMobile extends QueryInput

  ###
  constructor

  Just to set the queryInput

  @param {String} queryInput
  @param {Object} options
  @api public
  ###
  constructor: (@queryInput, options = {}) ->
    super(@queryInput)
    @launchOnClick = options.launchOnClick
    @lang = if options.lang then options.lang else "en"
    @endpoint = options.endpoint

    if @queryInput.length == 0
      console.warn "Doofinder: Query input does not exist."

    @form = @queryInput.closest('form').first()

    if not options.form
      options.form = {}

    if @form.length == 0
      css = options.form.css
      @wrappedInput = @queryInput

      if css == null 
        css = 
          display: 'inline-block'
          boxSizing: 'border-box'
          width: 0
          height: 0
          overflow: 'visible'
          backgroundColor: 'transparent'
          borderWidth: 0

      if options.form.wraps != null
        tmp = $(options.form.wraps)
        if tmp.length >= 1 
          # DON'T TRY TO WRAP MORE THAN ONE ELEMENT!
          @wrappedInput = tmp.get(0)
      
      @form = $('<form>').css(css);
      @form.insertBefore(@wrappedInput).append(@wrappedInput);
        
  ###
  start

  This is the function where bind the
  events to DOM elements.
  @api public
  ###
  init: (controller) ->
    
    @controller = controller

    _this = this
    
    if @launchOnClick
      @queryInput.on 'click', (e) ->
        e.preventDefault()
        _this.launchMobileVersion(false) # Doesn't add query param

    @form.removeAttr('onsubmit')
    @form.attr('method', 'get').attr('action', @getMobileVersionURL())

    @form.on 'submit', (e) ->
      e.preventDefault()
      _this.launchMobileVersion.call(_this)
      return false

    if @form.find('input[type="submit"], button[type="submit"]').length == 0 
      @queryInput.on 'keypress', (e) -> 
        if e.keyCode == 13
          _this.form.trigger 'submit'

  launchMobileVersion: (query) ->
    url = @getMobileVersionURL()
    if typeof query == 'undefined'
      query = @queryInput.val()
    else if  query == false 
      query = ''
    
    query = $.trim(query);

    if query.length > 0 
      url = url + '?query=' + query;
    
    window.location.href = url

  getMobileVersionURL: () ->
    protocol = '//'
    pattern = /-app.doofinder.com/
    if not pattern.test @options.endpoint
        protocol = 'http://' # we can't provide ssl with custom domain
    
    return "#{protocol}#{@endpoint}/#{@lang}/mobile/#{@controller.client.hashid}"

module.exports = QueryInputMobile