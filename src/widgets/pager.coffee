Display = require "./display"
$ = require "../util/dfdom"
merge = require "../util/merge"


class Pager extends Display
  @defaultTemplate = """
    {{#pager}}
      <ul class="df-pagination">
        <li class="df-page{{^previous}} df-page--disabled{{/previous}}">
          {{#previous}}
          <a href="#page-{{.}}" data-page="{{.}}">
            {{#translate}}{{{previousLabel}}}{{/translate}}
          </a>
          {{/previous}}
          {{^previous}}
          <span>
            {{#translate}}{{{previousLabel}}}{{/translate}}
          </span>
          {{/previous}}
        </li>
        {{#first}}
          <li class="df-page">
            <a href="#page-{{.}}" data-page="{{.}}">{{.}}</a>
          </li>
          <li class="df-page df-page--disabled">
            <span>…</span>
          </li>
        {{/first}}
        {{#pages}}
          <li class="df-page{{#current}} df-page--disabled{{/current}}">
            {{#current}}
              <span data-page="{{page}}">{{page}}</span>
            {{/current}}
            {{^current}}
              <a href="#page-{{page}}" data-page="{{page}}">{{page}}</a>
            {{/current}}
          </li>
        {{/pages}}
        {{#last}}
          <li class="df-page df-page--disabled">
            <span>…</span>
          </li>
          <li class="df-page">
            <a href="#page-{{.}}" data-page="{{.}}">{{.}}</a>
          </li>
        {{/last}}
        <li class="df-page{{^next}} df-page--disabled{{/next}}">
          {{#next}}
            <a href="#page-{{.}}" data-page="{{.}}">
              {{#translate}}{{{nextLabel}}}{{/translate}}
            </a>
          {{/next}}
          {{^next}}
            <span>
              {{#translate}}{{{nextLabel}}}{{/translate}}
            </span>
          {{/next}}
        </li>
      </ul>
    {{/pager}}
  """

  constructor: (element, options) ->
    defaults =
      delta: 2 # number of links on each side of the current page
      previousLabel: "Previous"
      nextLabel: "Next"
    options = merge defaults, options
    super element, options

  ###*
   * Initialize: Listen to clicks on active pages
  ###
  init: ->
    unless @initialized
      @element.on "click", "[data-page]", (e) =>
        e.preventDefault()
        link = $ e.currentTarget
        @controller.getPage (parseInt (link.data "page"), 10)
      super

  ###*
   * Builds context for the pager based on the current page.
   *
   * @param  {Number} page Current page.
   * @return {Object}      Data to be added to the context.
  ###
  __buildPagerContext: (page) ->
    firstPage = 1                   # for clarity
    lastPage = @controller.lastPage # fix value

    nLinks = 1 + @options.delta * 2 # number of links in the main block

    # compose main block depending on the current page
    if (page - @options.delta - 1) <= firstPage
      # [1,2,3,...]
      pages = [1..(Math.min nLinks, lastPage)]
    # else if page is lastPage or page + nLinks > lastPage
    else if (page + @options.delta + 1) >= lastPage
      # [...,8,9,10]
      pages = [(Math.max (lastPage - nLinks + 1), firstPage)..lastPage]
    else
      # [...,4,5,6,...]
      pages = [(page - @options.delta)..(page + @options.delta)]

    pager =
      # previous link must work?
      previous: if (p = page - 1) < firstPage then false else p
      # next link must work?
      next: if (n = page + 1) > lastPage then false else n
      # should I render first page separately?
      first: if pages[0] != firstPage then firstPage else false
      # should I render last page separately?
      last: if pages[-1..][0] != lastPage then lastPage else false
      # main block of pages to render
      pages: pages.map (p) -> page: p, current: (p is page)
      # labels
      previousLabel: @options.previousLabel
      nextLabel: @options.nextLabel

  __buildContext: (response) ->
    if response.total > response.results_per_page
      pager = @__buildPagerContext response.page
    else
      pager = false

    super (merge pager: pager, response)


module.exports = Pager
