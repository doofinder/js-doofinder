[![Build Status](https://api.travis-ci.org/doofinder/js-doofinder.svg?branch=master)](https://travis-ci.org/doofinder/js-doofinder)

# jsDoofinder
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
* [Examples](#examples)
  * [Example 1: Create a simple template to show results.](#example-1-create-a-simple-template-to-show-results)
  * [Example 2: Adding extra info to our template.](#example-2-adding-extra-info-to-our-template)
  * [Example 3: Create a custom template function.](#example-3-create-a-custom-template-function)

## Installation
### npm
`npm install doofinder`

### bower
`bower install doofinder`

### Downloadable minified javascript file
https://cdn.jsdelivr.net/doofinder/latest/doofinder.min.js

### CSS
We offer some simple CSS. You can download it in the link
https://cdn.jsdelivr.net/doofinder/latest/doofinder.css


## Quick Start

In this example we'll write a view that will just show results.

Let's begin by showing a simple HTML template (myview.html):

```html
<html lang="en">
<head>
<script type="application/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<script type="application/javascript" src="https://cdn.jsdelivr.net/doofinder/latest/doofinder.min.js"></script>
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

We need to create the inner scroll via css. We get it setting the sroll wrapper's height and overflow as you can see above. It is also necessary set the position to "relative" in order to calculate the scroll position to ask for the next page.

The options we have filled in for the Client:
* hashid: the unique hashid of your search engine.
* zone: the zone where your search engine is located (eu1, us1, ...).

For the QueryInput widget:
* queryInput selector: the CSS selector of our query input.

For the ScrollResults widget:
* scroll selector: the CSS selector for the scroll wrapper.

**WARNING**: Note that Doofinder Search API is protected with CORS, so
you must enable the host you are requesting from. You can do this from
your Doofinder Administration Panel > Configuration > Allowed Domains.

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

#### addParam
Adds new search parameter to the current status.

 Argument | Required | Type | Description
 -------- | -------- | ---- | ---------------------
 param  | Yes | `String` | The name of the param.
 value | Yes |`Mixed` | The value of the param.

#### clearParam
Removes a parameter from the current status.

Argument | Required | Type | Description
-------- | -------- | ---- | ---------------------
param  | Yes | `String` | The name of the param.

#### reset
Gets the params to the initial state.

#### setSearchParam
Sets a param for every query.

Argument | Required | Type | Description
-------- | -------- | ---- | ---------------------
param  | Yes | `String` | The name of the param.
value | Yes |`Mixed` | The value of the param.


#### refresh
Makes a search with the current filter status. Then, it calls to every widget to render the results.

#### addWidget
Adds a widget to the controller after the instantiation.

 Argument | Required | Type | Description
 -------- | --------- |---- | ---------------------
  widget |  Yes |`doofinder.Widget` | The widget to add.

#### bind
This method adds a callback to an event triggered from the controller. Events are triggered from the controller when a query is going to be done or when results are received.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
event |  Yes | `String` | The event name.
callback | Yes | `Function` | The function which receives the API Search response.

The events you can bind in widget are the described above. Note that each event sends different arguments to the callback in order to implement it properly.


Event Name | Callback Arguments | Description
---------- | ------------------ | -----------
df:search   | <ul><li>event`Object`: object with the event information.</li><li>params`Object`: the object will be send as params to the Search API.</li></ul> | This event is triggered when controller.search is called.
df:next_page  | <ul><li>event`Object`: object with the event information.</li><li>params`Object`: the object will be send as params to the Search API.</li></ul> | This event is triggered when controller.nextPage is called.
df:get_page   | <ul><li>event`Object`: object with the event information.</li><li>params`Object`: the object will be send as params to the Search API.</li></ul> | This event is triggered when controller.getPage is called.
df:results_received | <ul><li>event`Object`: object with the event information.</li><li>res`Object`: the Search API response</li></ul> | This event is triggered when new results are received from Search API.

As an example, we'll print in the console the total results in the `df:results_received` event.

```javascript
controller = new doofinder.Controller(client, widgets, options);
controller.bind('df:results_received', function(event, res){
   console.log(res.total);
});
```

#### registerSession
Sends a request to the Search API in order to account the sessions in your SearchEngine.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
sessionId |  Yes | `String` | A session identifier
callback | No | `Function` | Receives two args: `err` and `response`

#### registerClick
Sends a request to the Search API in order to account the clicks for a product.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
id |  Yes | `String` | Unique identifier of the item in the datafeed
options | No | `Object` | Additional options like `sessionId` (default `"session_id"`), `query` (default `""`), `datatype` (default `"product"`)
callback | No | `Function` | Receives two args: `err` and `response`

#### registerCheckout
Sends a request to the Search API in order to account the sales for your SearchEngine.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
sessionId |  Yes | `String` | A session identifier.
options | No | `Object` | Additional options like `query`
callback | No | `Function` | Receives two args: `err` and `response`


### options
Sends a request to the Search API in order to receive server configuration. The response received is like this:

```javascript
{"currency":
  {"format":"%s%v",
   "symbol":"$",
   "label":"Hong Kong Dollar",
   "decimal":".",
   "thousand":",",
   "precision":2
   },
   "query_limit_reached":false,
   "mobile":{"endpoint":"mobile.mydomain.com"},
   "facets":[{"name":"brand",
   	        "es_definition":{"terms":{"field":"brand.facet","size":20}},
   	        "label":"Brand","type":"terms","field":"brand.facet","size":20},
   	     {"name":"sale_price",
   	      "es_definition":{
   	      	"range":{
   	      	"ranges":[{"from":0}],"field":"sale_price"
   	      	}
   	      },
   	      "label":"Sale",
   	      "type":"range",
   	      "ranges":[{"from":0}],"field":"sale_price"
   	      }
   	     ],
   "hasMobileEnabled":false
   	  }

```


### Widget
Widgets are visual elements that take part into the search. They can be search inputs, places where display the results, places to put the facets, etc.
The events you can bind in widget depend on the widget you are instantiating. Above we'll describe all the available widget and theirs correponding events.


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

`widgets.QueryInput` has no associated events.

### widgets.Display
This widget shows the results in a DOM node. When a new search or filter is done the new content will replace the older. This widget doesn't have paging.

#### constructor

Argument | Required | Type | Description
-------- | --------- | ---- | ---------------------
container |  Yes | `String` | Results container CSS selector.
options |  No | `Object` | Options to configure the input.

Option | Type | Description
------ |  ---- |  --------------
template | `String` | [Mustache](http://mustache.github.io/) template to shape the results.
templateVars | `Object` | Extra info you want to render in the template. Look at [Example 2](#example-2-adding-extra-info-to-our-template).
templateFunctions | `Object` | Custom helpers to use in your template. Look at [Example 3](#example-3-create-a-custom-template-function).

#### bind
This method adds a callback to an event triggered from the widget. Events are triggered from every widget when a query is going to be done or when results are received or when they are rendered in a widget.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
event |  Yes | `String` | The query terms.
callback | Yes | `Function` | The function which receives the API Search response.

The events you can bind in widget are the described above. Note that each event sends different arguments to the callback in order to implement it properly.

Event Name | Callback Arguments | Description
---------- | ------------------ | -----------
df:rendered   | <ul><li>event`Object`: object with the event information.</li><li>res`Object`: Doofinder Search API response.</li></ul> | This event is triggered when the results are rendered.

As an example, we'll print in the console the total results in the `df:rendered` event.

```javascript
results = new doofinder.widgets.Display(container, options);
results.bind('df:rendered', function(event, res){
   console.log(res.total);
});
```

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
template | `String` | [Mustache](http://mustache.github.io/) template to shape the results.
templateVars | `Object` | Extra info you want to render in the template. Look at [Example 2](#example-2-adding-extra-info-to-our-template).
templateFunctions | `Object` | Custom helpers to use in your template. Look at [Example 3](#example-3-create-a-custom-template-function).

#### bind
This method adds a callback to an event triggered from the widget. Events are triggered from every widget when a query is going to be done or when results are received or when they are rendered in a widget.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
event |  Yes | `String` | The query terms.
callback | Yes | `Function` | The function which receives the API Search response.

The events you can bind in widget are the described above. Note that each event sends different arguments to the callback in order to implement it properly.

Event Name | Callback Arguments | Description
---------- | ------------------ | -----------
df:rendered   | <ul><li>event`Object`: object with the event information.</li><li>res`Object`: Doofinder Search API response.</li></ul> | This event is triggered when the results are rendered.

As an example, we'll print in the console the total results in the `df:rendered` event.

```javascript
results = new doofinder.widgets.Results(container, options);
results.bind('df:rendered', function(event, res){
   console.log(res.total);
});
```

### widgets.ScrollResults

This widget render the results in an DOM node with an inner scroll. So the next page will be requested when scroll reaches the bottom.

#### constructor

Argument | Required | Type | Description
-------- | --------- | ---- | ---------------------
container |  Yes | `String` | Results container CSS selector.
options |  No | `Object` | Options to configure the input.

The options to configure the widget are:

Option | Type | Description
------ |  ---- |  --------------
template | `String` | [Mustache](http://mustache.github.io/) template to shape the results.
templateVars | `Object` | Extra info you want to render in the template. Look at [Example 2](#example-2-adding-extra-info-to-our-template).
templateFunctions | `Object` | Custom helpers to use in your template. Look at [Example 3](#example-3-create-a-custom-template-function).
scrollOffset | `Number` | Distance in pixels to the bottom in scroll when next page is requested. Default 50.

There is some CSS you have to add to your container in order to make the inner scroll to work properly:

```css
#container {
  height: 800px;
  position: relative;
  overflow: auto;
}
```
In the example above `#container` could be your scroll container selector and the height can be set to the value you prefer.

#### bind
This method adds a callback to an event triggered from the widget. Events are triggered from every widget when a query is going to be done or when results are received or when they are rendered in a widget.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
event |  Yes | `String` | The event name.
callback | Yes | `Function` | The function which receives the API Search response.

The events you can bind in widget are the described above. Note that each event sends different arguments to the callback in order to implement it properly.

Event Name | Callback Arguments | Description
---------- | ------------------ | -----------
df:rendered   | <ul><li>event`Object`: object with the event information.</li><li>res`Object`: Doofinder Search API response.</li></ul> | This event is triggered when the results are rendered.
df:hit   | <ul><li>event`Object`: object with the event information.</li><li>dfid`String`: Doofinder Item Identifier. Useful to make the controller.hit call.</li><li>url`String`: The url associated to the item. Useful to make the controller.sendToGA call.</li></ul> | This event is triggered when a result link is clicked.

As an example, we'll print in the console the total results in the `df:rendered` event.

```javascript
results = new doofinder.widgets.ScrollResults(container, options);
results.bind('df:rendered', function(event, res){
   console.log(res.total);
});
```

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
template | `String` | [Mustache](http://mustache.github.io/) template to shape the results.
templateVars | `Object` | Extra info you want to render in the template. Look at [Example 2](#example-2-adding-extra-info-to-our-template).
templateFunctions | `Object` | Custom helpers to use in your template. Look at [Example 3](#example-3-create-a-custom-template-function).

#### bind
This method adds a callback to an event triggered from the widget. Events are triggered from every widget when a query is going to be done or when results are received or when they are rendered in a widget.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
event |  Yes | `String` | The event name.
callback | Yes | `Function` | The function which receives the API Search response.

The events you can bind in widget are the described above. Note that each event sends different arguments to the callback in order to implement it properly.

Event Name | Callback Arguments | Description
---------- | ------------------ | -----------
df:rendered   | <ul><li>event`Object`: object with the event information.</li><li>res`Object`: Doofinder Search API response.</li></ul> | This event is triggered when the facet is rendered.

As an example, we'll print in the console the total results in the `df:rendered` event.

```javascript
facet = new doofinder.widgets.TermFacet(container, options);
facet.bind('df:rendered', function(event, res){
   console.log(res.total);
});
```

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
template | `String` | [Mustache](http://mustache.github.io/) template to shape the results.
templateVars | `Object` | Extra info you want to render in the template. Look at [Example 2](#example-2-adding-extra-info-to-our-template).
templateFunctions | `Object` | Custom helpers to use in your template. Look at [Example 3](#example-3-create-a-custom-template-function).
sliderClassName | `String` | The CSS class of the node that holds the slider. It's injected into the template context.
sliderOptions | `Object` | We use [noUiSlider](http://refreshless.com/nouislider) and this option holds the slider configuration. Due to a buggy pips support, if no `pips` option is found, the widget paints them itself. If the `pips` option is `false`, no pips are displayed. In any other case, noUiSlider is in charge of displaying them.

#### bind
This method adds a callback to an event triggered from the widget. Events are triggered from every widget when a query is going to be done or when results are received or when they are rendered in a widget.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
event |  Yes | `String` | The event name.
callback | Yes | `Function` | The function which receives the API Search response.

The events you can bind in widget are the described above. Note that each event sends different arguments to the callback in order to implement it properly.

Event Name | Callback Arguments | Description
---------- | ------------------ | -----------
df:rendered   | <ul><li>event`Object`: object with the event information.</li><li>res`Object`: Doofinder Search API response.</li></ul> | This event is triggered when the facet is rendered.

As an example, we'll print in the console the total results in the `df:rendered` event.

```javascript
facet = new doofinder.widgets.RangeFacet(container, options);
facet.bind('df:rendered', function(event, res){
   console.log(res.total);
});
```

### Client

This is the class which makes the queries to the Doofinder Search API.

#### constructor
Argument | Required | Type | Description
-------- | --------- | ---- | ---------------------
hashid   | Yes  | `String` | The unique search engine identifier.
API Key/Zone  | Yes  | `String` | The secret key to authenticate the request or the doofinder zone.
types | No  | `Array` | An array of datatypes to restrict the queries to them.

**WARNING**: Do not use the API key unless you're coding on the server
side, if you don't put the API key just put the doofinder zone instead.

#### search
This method performs a Search API call and retrieves the data. The data will be received by a callback function.

 Argument | Required | Type | Description
 -------- | --------- |---- | ---------------------
 query |  Yes | `String` | The query terms.
 params |  No | `Object` | The query terms.
 callback | Yes | `Function` | The function which receives the API Search response.

#### registerSession
Sends a request to the Search API in order to account the sessions in your SearchEngine.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
sessionId |  Yes | `String` | A session identifier.
callback | No | `Function` | Receives two args: `err` and `response`

#### registerClick
Sends a request to the Search API in order to account the clicks for a product.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
id |  Yes | `String` | Unique identifier of the item in the datafeed.
options | No | `Object` | Additional options like `sessionId` (default `"session_id"`), `query` (default `""`), `datatype` (default `"product"`)
callback | No | `Function` | Receives two args: `err` and `response`

#### registerCheckout
Sends a request to the Search API in order to account the sales for your SearchEngine.

Argument | Required | Type | Description
-------- | --------- |---- | ---------------------
sessionId |  Yes | `String` | A session identifier.
options | No | `Object` | Additional options like `query`
callback | No | `Function` | Receives two args: `err` and `response`


## Examples

### Example 1: Create a simple template to show results.

In the [Quick Start](#quick-start) example we composed a simple view using the Doofinder Library. Let's see how to shape the results by a Mustache template.

```javascript

var resultsTemplate = '{{#results}}' +
  ' <div>'+
  '   <div>' +
  '     <a href="{{link}}">'+
  '       <img src="{{image_link}}" alt="{{title}}">'+
  '     </a>'+
  '     <div>'+
  '       <a target="_blank" data-df-hitcounter="{{dfid}}" href="{{link}}">'+
  '         <div>{{title}}</div>' +
  '         <div>{{description}}</div>' +
  '         <div>' +
  '          <span>{{#format-currency}}{{price}}{{/format-currency}}</span>' +
  '         </div>'+
  '       </a>' +
  '    </div>' +
  '  </div>' +
  '</div>' +
  '{{/results}}';

var resultsWidget = new doofinder.widgets.ScrollResults('#scroll', {template: resultsTemplate});

```

Let's have a look to the template:

- We used `{{#results}}` to iterate through the items.
- We used `{{field_name}}` tags to print the content of a field.
- We used `{{#field_name}}` to check the presence of a field.
- We used `{{#format-currency}}` helper to print the price with the coin symbol and formatted.
- Note that we use a data attribute (data-df-hitcounter) to show the dfid. You can use this to send it with the [Controller.hit](#hit) method.

### Example 2: Adding extra info to our template.

Maybe you have some items with no header and you want to show a standard one, just in case.

```javascript
var resultsWidget = new doofinder.widgets.ScrollResults('#scroll', {
  template: resultsTemplate,
  templateVars: {
    standardTitle: "My title"
    }
  });
```

So you can modify your template in order to show a standard title if there's no header supplied by the item.

```javascript

var resultsTemplate = '{{#results}}' +
  ' <div>'+
  '   <div>' +
  '     <a href="{{link}}">'+
  '       <img src="{{image_link}}" alt="{{title}}">'+
  '     </a>'+
  '     <div>'+
  '       <a target="_blank" data-df-hitcounter="{{dfid}}" href="{{link}}">'+
  '         {{#title}}' +
  '         <div>{{title}}</div>' +
  '         {{/title}}' +
  '         {{^title}}' +
  '         <div>{{standardTitle}}</div>' +
  '         {{/title}}' +
  '         <div>{{description}}</div>' +
  '       </a>' +
  '    </div>' +
  '  </div>' +
  '</div>' +
  '{{/results}}';

var resultsWidget = new doofinder.widgets.ScrollResults('#scroll', {
  template: resultsTemplate,
  templateVars: {
    standardTitle: "My title"
    }
  });
```

### Example 3: Create a custom template function.

Template functions are called helpers in [Mustache](http://mustache.github.io/). You can create and add custom helpers to your template by using the `templateFunctions` option. We'll create a helper that convert a text in bold.

```javascript

{
  templateFunctions: {
    bold: function(){
      function(text, render){
        return "<b>" + render(text) + "</b>"
      }
    }
}

```
This helper will take the text in the tag and will wrapper it with the `<b>` tag. Note that `render(text)` returns the text wrapped by the helper.

We'll use the helper to show the header and instantiate the widget.

```javascript
var resultsTemplate = '{{#results}}' +
  ' <div>'+
  '   <div>' +
  '     <a href="{{link}}">'+
  '       <img src="{{image_link}}" alt="{{link}}">'+
  '     </a>'+
  '     <div>'+
  '       <a target="_blank" data-df-hitcounter="{{dfid}}" href="{{link}}">'+
  '         <div>{{#bold}}{{title}}{{/bold}}</div>' +
  '         <div>{{description}}</div>' +
  '         <div>' +
  '          <span>{{#format-currency}}{{price}}{{/format-currency}}</span>' +
  '         </div>'+
  '       </a>' +
  '    </div>' +
  '  </div>' +
  '</div>' +
  '{{/results}}';

var resultsWidget = new doofinder.widgets.ScrollResults('#scroll', {
  template: resultsTemplate,
  templateFunctions: {
    bold: function(){
      return function(text, render){
        return "<b>" + render(text) + "</b>"
      }
    }
  }
});

```






