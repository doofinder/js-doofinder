extend = require "extend"
Display = require "./display"
$ = require "../util/dfdom"

class Pager extends Display
  @defaultTemplate = """
    {{#pager}}
      <ul class="df-pagination">
        <li class="df-page{{^previous}} df-page--disabled{{/previous}}">
          {{#previous}}
          <a href="#page-{{.}}" data-page="{{.}}">
            {{#translate}}{{previousLabel}}{{/translate}}
          </a>
          {{/previous}}
          {{^previous}}
          <span data-page="{{.}}">
            {{#translate}}{{previousLabel}}{{/translate}}
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
              {{#translate}}{{nextLabel}}{{/translate}}
            </a>
          {{/next}}
          {{^next}}
            <span data-page="{{.}}">
              {{#translate}}{{nextLabel}}{{/translate}}
            </span>
          {{/next}}
        </li>
      </ul>
    {{/pager}}
  """

  constructor: (element, options) ->
    defaults =
      delta: 2
      previousLabel: "Previous"
      nextLabel: "Next"
    options = extend true, defaults, options
    super element, options

  init: ->
    unless @initialized
      @element.on "click", "[data-page]", (e) =>
        e.preventDefault()
        link = $ e.currentTarget
        @controller.getPage (parseInt (link.data "page"), 10)
      super

  __getPager: (page) ->
    firstPage = 1
    lastPage = @controller.lastPage

    nLinks = 1 + @options.delta * 2

    if page is firstPage or (page - @options.delta) <= @options.delta
      pages = [1..(Math.min nLinks, lastPage)]
    else if page is lastPage or page + nLinks > lastPage
      pages = [(Math.max (lastPage - nLinks + 1), firstPage)..lastPage]
    else
      pages = [(page - @options.delta)..(page + @options.delta)]

    pager =
      previous: if (p = page - 1) < firstPage then false else p
      next: if (n = page + 1) > lastPage then false else n
      first: if pages[0] != firstPage then firstPage else false
      last: if pages[-1..][0] != lastPage then lastPage else false
      pages: pages.map (p) -> page: p, current: (p is page)
      current: page
      previousLabel: @options.previousLabel
      nextLabel: @options.nextLabel

  __buildContext: (response) ->
    if response.total > response.results_per_page
      pager = @__getPager response.page
    else
      pager = false

    console.log pager

    super (extend true, pager: pager, response)


module.exports = Pager
