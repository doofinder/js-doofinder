# jsDoofinder
Is a library that allow you to make requests to Doofinder Search Engines and show the results in your website. You'll be able to retrieve and shape your data easily with it.

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

## Quick Start

In this example we'll write a view that will just show results.

Let's begin by showing a simple HTML template (myview.html):

```html
<html lang="en">
<head>
<script type="application/javascript" src="path/to/your/js/doofinder.min.js"></script>
<script type="application/javascript" src="path/to/your/js/myview.js"></script>
</head>
<body>
  <input type="text" id="query"/>
  <div id="scroll">
    <div id="container"></div>
    </div>
  </div>
</body>
```
Note that we are importing two javascript files:
- doofinder.min.js: contains doofinder namespace with its classes.
- myview.js: contains specific info about my view and thats the place where we'll instantiate Controller.

We need to create the inner scroll via css.

```css
#scroll{
    position: relative;
    height: 800px;
    overflow: auto;
}
```

Let's add some functionality to our html view:

```javascript
(function(doofinder, document){
  
  var hashid = 'a3fd9dcvga0932el99ds4az';
  var zone = 'eu1';
  var queryInput = '#query';
  var scrollWrapper = '#scroll';
  var container = '#container'; // required

  $(document).ready(function(){ 
    // Instantiation
    var client = new doofinder.Client(hashid, zone);
    var queryInputWidget = new doofinder.widgets.QueryInput(queryInput);
    var resultsWidget = new doofinder.widgets.ScrollResults(
        scrollWrapper, 
        container
        );
    var controller = new doofinder.Controller(
        Client, 
        [queryInputWidget, resultsWidget]
        );
    controller.start();

  });

})(doofinder, document);
```

The options we have filled in:

* hashid: the unique hashid for your search engine.
* zone: the zone where is your search engine (eu1, us1)
* queryInput: the CSS selector of our query input.
* scrollWrapper: the CSS selector for the scroll.
* container: the CSS selector of our hits container.

At the moment, we have a search box where we can write a query and results we'll be shown since the fourth character we type and the results in a scroll who asks for the next page when last element is reached.

## Classes

### Controller
Controller is the class that manages client and widgets. Allows you to make different queries to your index and interact with the different widgets you will instantiate.

#### constructor

  Argument | Character | Type | Description 
  -------- | --------- |---- | ---------------------
  client   | required | `doofinder.Client` | The Search API wrapper
  widgets  | required | `doofinder.Widget` `Array(doofinder.Widget)` | The widgets for interacting and painting results
  initialParams | optional | `Object` | An object with params that will passed to the client for every search. You can use here all the parameters defined in [Doofinder Search API](http://doofinder.com/en/developer/search-api).

#### search

  Argument | Character | Type | Description 
  -------- | --------- | ---- | ---------------------
  query    | required  | `String` | The query terms.
  params   | optional  | `Object` | An object with search parameters. You can use here all the parameters defined in [Doofinder Search API](http://doofinder.com/en/developer/search-api).

#### nextPage
Ask for the next page, so increment the current and send the response to all widget's renderNext methods.


#### getPage
Ask for a page. Then pass the response to all widget's render methods.

  Argument | Character | Type | Description 
  -------- | --------- | ---- | ---------------------
  page     | required  | Number | The page requested

#### addFilter
Adds a filter to the currently applied.
  
  Argument | Character | Type | Description 
  -------- | --------- | ---- | ---------------------
  facet  | required | `String` | The name of the facet.
  value | required |`String` `Object` | The filter to add. This can be a `String`, if the facet is a term facet or an `Object` if it's a range.

#### removeFilter
Removes a filter from the currently applied.

  Argument | Character | Type | Description 
  -------- | --------- | ---- | ---------------------
  facet | required | `String` | The name of the facet.
  value | required |`String` `Object` | The filter to remove. This can be a `String`, if the facet is a term facet or an `Object` if it's a range.

#### refresh
Makes a search with the current filter status. Then, it calls to every widget's render method.

#### addWidget
Adds a widget to the controller after the instantiation.
 
 Argument | Character | Type | Description 
 -------- | --------- |---- | ---------------------
  widget |  required |`doofinder.Widget` | The widget to add.



### Widget
Widget is just a contract to accomplish for every widget we'll describe next. Once you have injected the wigdets to the controller. 

#### bind
This method adds callback to an event triggered for the widget. Events are triggered for every widget when a query is going to be done or when results are received or when they are rendered in a widget.

Argument | Character | Type | Description 
-------- | --------- |---- | ---------------------
event |  required | `String` | The query terms.
callback | required | `Function` | The function which receives the API Search response.

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

Argument | Character | Type | Description 
-------- | --------- | ---- | ---------------------
selector |  required | `String` | Input CSS selector.
options |  optional | `Object` | Options to configure the input.

The options to configure the input are:

Option | Type | Description
------ |  ---- |  --------------
wait | `Number` | milliseconds that the widget waits to check the input content length.
captureLength | `Number` | number of characters typed when first search is performed


### widgets.results.Results
This widget shows the results in a DOM node. When a new search or filter is done or a new page is requested the new content will replace the older.

#### constructor

Argument | Character | Type | Description 
-------- | --------- | ---- | ---------------------
container |  required | `String` | Results container CSS selector.
options |  optional | `Object` | Options to configure the input.

The options to configure the widget are:

Option | Type | Description
------ |  ---- |  --------------
template | `String` | Template to shape the results.
extraContext | `Object` | Extra info you want to render in the template.



### widgets.results.ScrollResults

#### constructor

Argument | Character | Type | Description 
-------- | --------- | ---- | ---------------------
container |  required | `String` | Results container CSS selector.
options |  optional | `Object` | Options to configure the input.

The options to configure the widget are:

Option | Type | Description
------ |  ---- |  --------------
template | `String` | Template to shape the results.
extraContext | `Object` | Extra info you want to render in the template.

### widgets.facets.TermFacet

#### constructor

Argument | Character | Type | Description 
-------- | --------- | ---- | ---------------------
container |  required | `String` | Results container CSS selector.
options |  optional | `Object` | Options to configure the input.

The options to configure the widget are:

Option | Type | Description
------ |  ---- |  --------------
template | `String` | Template to shape the results.
extraContext | `Object` | Extra info you want to render in the template.

### widgets.facets.RangeFacet

#### constructor

Argument | Character | Type | Description 
-------- | --------- | ---- | ---------------------
container |  required | `String` | Results container CSS selector.
options |  optional | `Object` | Options to configure the input.

The options to configure the widget are:

Option | Type | Description
------ |  ---- |  --------------
template | `String` | Template to shape the results.
extraContext | `Object` | Extra info you want to render in the template.

### Client

#### constructor
Argument | Character | Type | Description 
-------- | --------- | ---- | ---------------------
hashid   | required  | `String` | The unique search engine identifier.
API Key  | required  | `String` | The secret key to authenticate the request.
types | optional  | `Array` | An array of datatypes to restrict the queries to them.

#### search
This method performs a Search API call and retrieves the data. The data will be received by a callback function.

 Argument | Character | Type | Description 
 -------- | --------- |---- | ---------------------
 query |  required | `String` | The query terms.
 params |  optional | `Object` | The query terms.
 callback | required | `Function` | The function which receives the API Search response.



 
