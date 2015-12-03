# jsDoofinder (In progress)
This library allows you to make requests to [Doofinder](http://www.doofinder.com) Search Engines and show the results in your website. You'll be able to retrieve and shape your data easily with it.

## Summary

* [Installation](#installation)
* [Quick Start](#quick-start)
* [Classes](#classes)
	* [Controller](#controller)
	* [Widget](#widget)
		* [QueryInput](#widgetsqueryinput)
		* [Results](#widgetsresults)
		* [ScrollResults](#widgetsscrollresults)
		* [TermFacet](#widgetstermfacet)
		* [RangeFacet](#widgetsrangefacet)
	* [Client](#client)

## Installation
### npm
`npm install doofinder`

### bower
`bower install doofinder`

### Downloadable minified javascript file
https://raw.githubusercontent.com/doofinder/js-doofinder/master/dist/doofinder.min.js

### CSS
We offer some simple CSS. You can download it in the link
https://raw.githubusercontent.com/doofinder/js-doofinder/master/dist/doofinder.css


## Quick Start

In this example we'll write a view that will just show results.

Let's begin by showing a simple HTML template (myview.html):

```html
<html lang="en">
<head>
<script type="application/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script type="application/javascript" src="path/to/your/js/doofinder.min.js"></script>
<script>
(function(doofinder, document){
  $(document).ready(function(){
    // Use here your Search Engine hashid and doofinder zone
    var client = new doofinder.Client('97be6c1016163d7e9bceedb5d9bbc032', 'eu1');
    // #query is the DOM selector that points to the search box
    var queryInputWidget = new doofinder.widgets.QueryInput('#query');
    // #scroll is where we'll display the results
    var resultsWidget = new doofinder.widgets.ScrollResults('#scroll');
    // The controller to rule them all
    var controller = new doofinder.Controller(
        client,
        [queryInputWidget, resultsWidget]
    );
  });
})(doofinder, document);
</script>
<style>
#scroll{
    position: relative;
    height: 800px;
    overflow: auto;
}
</style>
</head>
<body>
  <input type="text" id="query"/>
  <div id="scroll">
  </div>
</body>
```
Note that we are importing two javascript files:
- jquery.min.js: we use it to make sure that everything is being done when the document is ready.
- doofinder.min.js: contains doofinder namespace with its classes.

We need to create the inner scroll via css.

The options we have filled in for the Client:
* hashid: the unique hashid of your search engine.
* zone: the zone where your search engine is located (eu1, us1, ...).

For the QueryInput widget:
* queryInput selector: the CSS selector of our query input.

For the ScrollResults widget:
* scroll selector: the CSS selector for the scroll wrapper.

**WARNING**: Note that Doofinder Search API is protected with CORS, so you must enable the host you are requesting from. You can do this from your Doofinder Administration Panel > Configuration > TODO(@ecoslado) This feature in Admin Panel.

With all this in place you'll have a search box where you can write a query and the results will be shown. Scrolling into the layer you'll see more results.

## Classes

### Controller
Controller is the class that manages client and widgets. Allows you to make different queries to your index and interact with the different widgets you will instantiate.

#### constructor

  Argument | Required | Type | Description
  -------- | -------- |---- | ---------------------
  client   | Yes | `doofinder.Client` | The Search API wrapper
  widgets  | Yes | `doofinder.Widget` `Array(doofinder.Widget)` | Array of widgets for interacting and rendering the results
  searchParameters | No | `Object` | An object with params that will passed to the client for every search. You can use here all the parameters defined in [Doofinder Search API](http://doofinder.com/en/developer/search-api).

#### search
This method makes a query to the Search API and renders the results into the widgets.

  Argument | Required | Type | Description
  -------- | -------- | ---- | ---------------------
  query    | Yes  | `String` | The query terms.
  params   | No  | `Object` | An object with search parameters. You can use here all the parameters defined in [Doofinder Search API](http://doofinder.com/en/developer/search-api).

#### nextPage
Asks for the next page of the previous search done, and sends the response to all widgets to render it.

#### getPage
Asks for a concrete page. Then pass the response to all widgets to render it.

  Argument | Required  | Type | Description
  -------- | -------- | ---- | ---------------------
  page     | Yes  | `Number` | The page requested

#### addFilter
Adds a filter to the currently applied in the search.

  Argument | Required | Type | Description
  -------- | -------- | ---- | ---------------------
  facet  | Yes | `String` | The name of the facet.
  value | Yes |`String` `Object` | The value the facet should have. This can be a `String`, if the facet is a term facet or an `Object` if it's a range.

#### removeFilter
Removes a filter from the currently applied.

  Argument | Required | Type | Description
  -------- | -------- | ---- | ---------------------
  facet | Yes | `String` | The name of the facet.
  value | Yes |`String` `Object` | The value of the facet. This can be a `String`, if the facet is a term facet or an `Object` if it's a range.

#### refresh
Makes a search with the current filter status. Then, it calls to every widget to render the results.

#### addWidget
Adds a widget to the controller after the instantiation.

 Argument | Required | Type | Description
 -------- | --------- |---- | ---------------------
  widget |  Yes |`doofinder.Widget` | The widget to add.



### Widget
Widgets are visual elements that take part into the search. They can be search inputs, places where display the results, places to put the facets, etc.

#### bind
This method adds a callback to an event triggered from the widget. Events are triggered from every widget when a query is going to be done or when results are received or when they are rendered in a widget.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
event |  Yes | `String` | The query terms.
callback | Yes | `Function` | The function which receives the API Search response.

The events you can bind in widget are the described above. Note that each event sends different arguments to the callback in order to implement it properly.

Event Name | Callback Arguments | Description
---------- | ------------------ | -----------
df:search   | <ul><li>params`Object`: the object will be send as params to the Search API.</li></ul> | This event is triggered when controller.search is called.
df:next_page  | <ul><li>params`Object`: the object will be send as params to the Search API.</li></ul> | This event is triggered when controller.nextPage is called.
df:get_page   | <ul><li>params`Object`: the object will be send as params to the Search API.</li></ul> | This event is triggered when controller.getPage is called.
df:results_received | <ul><li>res`Object`: the Search API response</li></ul> | This event is triggered when new results are received from Search API.
df:results_rendered | <ul><li>resObject`: the Search API response</li></ul> | This event is triggered when the results are rendered in the widget.


### widgets.QueryInput
This widget triggers searches when a user types on it.

#### constructor

Argument | Required | Type | Description
-------- | --------- | ---- | ---------------------
selector |  Yes | `String` | Input CSS selector.
options |  No | `Object` | Options to configure the input.

The options to configure the input are:

Option | Type | Description
------ |  ---- |  --------------
wait | `Number` | milliseconds that the widget waits to check the input content length.
captureLength | `Number` | number of Requireds typed when first search is performed


### widgets.Results
This widget shows the results in a DOM node. When a new search or filter is done or a new page is requested the new content will replace the older.

#### constructor

Argument | Required | Type | Description
-------- | --------- | ---- | ---------------------
container |  Yes | `String` | Results container CSS selector.
options |  No | `Object` | Options to configure the input.

The options to configure the widget are:

Option | Type | Description
------ |  ---- |  --------------
template | `String` | Template to shape the results.
templateVars | `Object` | Extra info you want to render in the template.



### widgets.ScrollResults

This widget render the results in an DOM node with an inner scroll.

#### constructor

Argument | Required | Type | Description
-------- | --------- | ---- | ---------------------
container |  Yes | `String` | Results container CSS selector.
options |  No | `Object` | Options to configure the input.

The options to configure the widget are:

Option | Type | Description
------ |  ---- |  --------------
template | `String` | Template to shape the results.
templateVars | `Object` | Extra info you want to render in the template.

### widgets.TermFacet

This widget render a term facet in a list of terms.

#### constructor

Argument | Required | Type | Description
-------- | --------- | ---- | ---------------------
container |  Yes | `String` | Results container CSS selector.
name | Yes | `String`| The facet key.
options |  No | `Object` | Options to configure the input.

The options to configure the widget are:

Option | Type | Description
------ |  ---- |  --------------
template | `String` | Template to shape the results.
templateVars | `Object` | Extra info you want to render in the template.

### widgets.RangeFacet

This widget render a range facet in a slider. To show it properly is necessary some
CSS. You can add this stylesheet:

https://raw.githubusercontent.com/doofinder/js-doofinder/master/dist/doofinder.css

#### constructor

Argument | Required | Type | Description
-------- | --------- | ---- | ---------------------
container |  Yes | `String` | Results container CSS selector.
name | Yes | `String`| The facet key.
options |  No | `Object` | Options to configure the input.

The options to configure the widget are:

Option | Type | Description
------ |  ---- |  --------------
template | `String` | Template to shape the results.
templateVars | `Object` | Extra info you want to render in the template.

### Client

#### constructor
Argument | Required | Type | Description
-------- | --------- | ---- | ---------------------
hashid   | Yes  | `String` | The unique search engine identifier.
API Key  | Yes  | `String` | The secret key to authenticate the request.
types | No  | `Array` | An array of datatypes to restrict the queries to them.

#### search
This method performs a Search API call and retrieves the data. The data will be received by a callback function.

 Argument | Required | Type | Description
 -------- | --------- |---- | ---------------------
 query |  Yes | `String` | The query terms.
 params |  No | `Object` | The query terms.
 callback | Yes | `Function` | The function which receives the API Search response.
