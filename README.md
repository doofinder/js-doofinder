[![Build Status](https://api.travis-ci.org/doofinder/js-doofinder.svg?branch=master)](https://travis-ci.org/doofinder/js-doofinder)

# Doofinder Library

A.K.A. `js-doofinder`, or just `doofinder`, this library makes easy to perform requests to Doofinder's search service and customize the way you present results.

<!-- MarkdownTOC depth="2" autolink="true" autoanchor="false" bracket="round" -->

- [Installation](#installation)
    - [NPM](#npm)
    - [Bower](#bower)
    - [CDN](#cdn)
- [TL;DR](#tldr)
- [Quick Start](#quick-start)
- [Client Reference](#client-reference)
    - [doofinder.Client](#doofinderclient)
- [Controller Reference](#controller-reference)
    - [doofinder.Controller](#doofindercontroller)
- [Widgets Reference](#widgets-reference)
    - [doofinder.widgets.Widget](#doofinderwidgetswidget)
    - [doofinder.widgets.QueryInput](#doofinderwidgetsqueryinput)
    - [doofinder.widgets.Display](#doofinderwidgetsdisplay)
    - [doofinder.widgets.ScrollDisplay](#doofinderwidgetsscrolldisplay)
    - [doofinder.widgets.TermsFacet](#doofinderwidgetstermsfacet)
    - [doofinder.widgets.RangeFacet](#doofinderwidgetsrangefacet)
- [Session Reference](#session-reference)
    - [doofinder.session.Session](#doofindersessionsession)
    - [doofinder.session.ObjectSessionStore](#doofindersessionobjectsessionstore)
    - [doofinder.session.CookieSessionStore](#doofindersessioncookiesessionstore)
- [Stats Reference](#stats-reference)
    - [doofinder.Stats](#doofinderstats)
- [How To](#how-to)
    - [Configure facet widgets dynamically](#configure-facet-widgets-dynamically)

<!-- /MarkdownTOC -->


## Installation

The library can be installed via package managers or directly pointing to a file in jsDelivr's CDN.

The package offers simple CSS you can obtain from the `dist` directory. It will help you to build a scaffolding of your project with little effort.

### NPM

```shell
$ npm install doofinder
```

### Bower

```shell
$ bower install doofinder
```

### CDN

You can include the library directly in your website:

```html
<!-- Javascript -->
<script src="//cdn.jsdelivr.net/npm/doofinder@latest/dist/doofinder.min.js"></script>
<!-- CSS -->
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/doofinder@latest/dist/doofinder.css">
```

## TL;DR

If you only want to know how this is structured, without the details, here we go.

The library provides:

- A `Client` class to perform requests to the [Doofinder] service.
- A `Controller` class which provides an easy-to-use wrapper for the client and holds `Widget` instances that will process the response from the service.
- A collection of widgets which render HTML _somewhere_ given a JSON search response, and provide a user interface to present results or refine search.
- A collection of utilities, like DOM manipulation, introspection, throttling… and that kind of stuff.

## Quick Start

The project includes a demo you can use as inspiration. To take a look and see things you can do with it:

1. Download the entire project from Github.
2. Install [Grunt] if not previously installed.
3. From the root of the project:
    1. install dependencies with `$ npm install`.
    2. Run the demo server with `$ grunt serve`.
4. Open `http://localhost:8008` in your browser.

The demo markup is inside `index.html` and the related Javascript code can be found at `demo/demo.js`.

**NOTICE:** The demo uses a test search engine but you can use a different one, just change the value of the `HASHID` variable you will find inside `index.html`.

**IMPORTANT:** [Doofinder] protects API calls with [CORS]. If you change the `HASHID` variable defined in `index.html` you will have to allow `localhost` for your search engine in [Doofinder Admin].

## Client Reference

**FOR THE SAKE OF SIMPLICITY THIS REFERENCE ONLY DESCRIBES CHANGES FOR CHILD CLASSES.**

### doofinder.Client

This class just make requests to [Doofinder]'s [Search API].

#### constructor

The client needs to know the search engine to use (`hashid`, the first parameter), and the search zone to use.

If you are using the client in a browser, your requests are protected by [CORS] so you will use the `zone` parameter only.

```javascript
var client = new doofinder.Client("dd485e41f1758def296e1bc7377f8ea7", {
  zone: "eu1"
});
```

However, if your requests are made server to server, you will have to authenticate requests with an API key which contains both the `zone` and a secret. In that case you can use the `apiKey` option and omit the `zone`.

```javascript
var client = new doofinder.Client("dd485e41f1758def296e1bc7377f8ea7", {
  apiKey: "eu1-4d186321c1a7f0f354b297e8914ab240"
});
```

To learn more about authentication read the [Search API] documentation.

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `hashid` | Yes | `String` | 32-char, unique id of a search engine. |
| `options` | Yes | `Object` | 

##### Options

One of `zone` and `apiKey` options are required. If both are set, search zone is extracted from `apiKey`.

| Option | Required | Type | Values | Default | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `zone` | Yes\* | `String` | `eu1`<br>`us1` || Search zone. | `eu1` |
| `apiKey` | Yes\* | `String` ||| Secret to authenticate requests. |
| `address` | No | `String` ||| Search server address.<br>For development purposes. |
| `version` | No | `String` || `"5"` | Search API version.<br>For development purposes. |

#### Client.request()

Performs a HTTP(S) GET request to the given resource of the [Doofinder] search API and passes any error or response to the provided callback function.

```javascript
client.request("/5/search?query=something", function(err, res){
  return (err ? processError(err) : processResponse(res));
});
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `resource` | Yes | `String` | API endpoint. Parameters are sent in the URL. |
| `callback` | Yes | `Function` | Callback to be called. |

#### Client.search()

Performs a search request to the [Doofinder] search API and passes any error or response to the provided callback function.

Can be called with 2 or 3 arguments:

```javascript
client.search("something", processResponse);
client.search("something", {page: 2}, processResponse);
```

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `query` | Yes | `String` | Search terms |
| `params` | No | `Object` | Parameters sent in the URL. | `{page: 1, rpp: 20}`
| `callback` | Yes | `Function` | Callback to be called. |

Read the [Search API] reference to learn more about available parameters.

#### Client.options()

Performs a request to get preferences for the search engine from the [Doofinder] server.

Can be called with 1 or 2 arguments:

```javascript
client.options(processOptions);
client.options("localhost", processOptions);
```

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `suffix` | No | `String` | Optional suffix to add to the request URL, like the domain of the current page. | `localhost` |
| `callback` | Yes | `Function` | Callback to be called. |

#### Client.stats()

Performs a request to submit stats events to Doofinder.

```javascript
// usage sample
client.stats("click", {
  dfid: "4d186321c1a7f0f354b297e8914ab240@product@437b930db84b8079c2dd804a71936b5f",
  session_id: "21d6f40cfb511982e4424e0e250a9557",
  query: "something"
}, processResponse);
```

**NOTICE:** You may want to use the [stats wrapper](#doofinderstats) included in the library instead of calling this method directly.

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Name of the event you want to send. |
| `params` | Yes* | `Object` | Parameters sent in the URL.<br>Most events need parameters but it depends on the event. |
| `callback` | No | `Function` | Callback to be called. |

Read the [Search API] reference to learn more about computing stats.

## Controller Reference

### doofinder.Controller

This class is aimed to easily search and display search results in a browser, managing search status and providing search results pagination capabilities.

Search status includes:

- Current page: Is always `1` when a fresh search is done.
- Last page available for the current query.
- Query name: Name of the query that Doofinder found that gave the best results so retrieving subsequent pages of results will use the same query.
- Query counter: to keep track of the requests made and maintain order.
- Request done: Whether a search request has been made or not.

#### constructor

This class uses a [Client](#doofinderclient) to retrieve search results, and some [widgets](#doofinderwidgetswidget) to paint results in the user interface.

Can be instantiated with a `Client` instance:

```javascript
controller = new doofinder.Controller(client);
```

But you can also pass extra parameters that will be sent in search requests:

```javascript
controller = new doofinder.Controller(client, {rpp: 20});
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `client` | Yes | `doofinder.Client` | Search client instance. |
| `params` | No | `Object` | Parameters to be added to all requests by default. |

Read the [Search API] reference to learn more about available parameters.

#### Controller.hashid

Shortcut property that returns the `hashid` of the search engine being used.

```javascript
controller.hashid // "dd485e41f1758def296e1bc7377f8ea7"
```

#### Controller.isFirstPage

Returns a boolean indicating if the last search performed by the controller was for the first page of results (`false` if no request was done).

```javascript
controller.isFirstPage // true, false
```

#### Controller.isLastPage

Returns a boolean indicating if the last search performed by the controller was for the last page of results (`false` if no request was done). If `true`, there's no next page of results for the current set of search parameters.

```javascript
controller.isLastPage // true, false
```

#### Controller.lastPage

Number of the last page available for the current search status. If no search was done returns `null`.

#### Controller.search()

Performs a new search request, removing any non-default parameters and resetting parameters to the defaults (like the page number, reset to `1`).

```javascript
controller.search("shirt", {filter: {brand: "NIKE"}});
```

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `query` | Yes | `String` | Search terms |
| `params` | No | `Object` | Parameters sent in the URL. | `{page: 1, rpp: 20}`

Read the [Search API] reference to learn more about available parameters.

#### Controller.getNextPage()

Given that a previous search request was done, performs a new search request to get the next page of results for the current status. Useful for infinite scroll behavior.

#### Controller.getPage()

Given that a previous search request was done, performs a new search request to get certain page of results for the current status. Useful for page by page pagination.

##### Arguments

| Argument | Required | Type | Description
| :--- | :---: | :---: | :--- |
| `page` | Yes | `Integer` | Number of the page of results to fetch.

#### Controller.refresh()

Given that a previous search request was done, performs a new search request to get the first page of results for the current status. Useful to start over again the current search.

#### Controller.reset()

Resets status and optionally forces search query terms and parameters to be set. Because it is a reset aimed to perform a new search, `page` has always value `1` when executing this.

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `query` | No | `String` | Search terms | `"something"`
| `params` | No | `Object` | Parameters sent in the URL. | `{page: 1, rpp: 20}`

Read the [Search API] reference to learn more about available parameters.

#### Controller.getParam()

Returns the value of a parameter from the status.

```javascript
controller.getParam("transformer");
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Name of the parameter to retrieve. |

#### Controller.setParam()

Sets the value of a parameter in the status hash.

```javascript
controller.setParam("transformer", null);
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Name of the parameter to set. |
| `value` | Yes | `*` | Value of the parameter to set.<br>Can be anything serializable in a URL querystring. |

#### Controller.removeParam()

Removes a parameter from the status hash.

```javascript
controller.removeParam("transformer");
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Name of the parameter to remove. |

#### Controller.getFilter()

Retrieves the value of a filter or undefined if not defined.

```javascript
controller.getFilter("brand");
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Filter name. |
| `paramName` | No | `String` | Name of the parameter that will hold the filters.<br>`"filter"` by default. |

#### Controller.setFilter()

Sets the value of a filter, replacing any existing value.

```javascript
// terms
controller.setFilter("brand", "NIKE"); // ["NIKE"]
controller.setFilter("brand", ["ADIDAS", "PUMA"]) // ["ADIDAS", "PUMA"]
// range
controller.setFilter("price", {gte: 10})
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Filter name. |
| `value` | Yes | `*` | If is a string, it's added as a one-item array.<br>Otherwise, it's added with no modifications. |
| `paramName` | No | `String` | Name of the parameter that will hold the filters.<br>`"filter"` by default. |

#### Controller.addFilter()

_Extends_ the current value of a filter with the provided value.

This means:

- If the filter does not already exist, the value is added like in `Controller.setFilter()`.
- If the filter already exists and is an array:
  + If the value is a single value, it is added to the array if not already there.
  + If the value is an array, only items not already in the filter are added.
- If the filter already exists, is a plain object and the value is also a plain object, new value is merged taking care of range incompatibilities.
- In any other case the new value replaces the existing one.


```javascript
controller.addFilter("brand", "NIKE"); // ["NIKE"]
controller.addFilter("brand", ["NIKE", "ADIDAS"]);  // ["NIKE", "ADIDAS"]
controller.addFilter("brand", "PUMA");  // ["NIKE", "ADIDAS", "PUMA"]

controller.addFilter("price", {gt: 10}); // {gt: 10}
controller.addFilter("price", {gte: 10, lte: 100}); // {gte: 10, lte: 100}

controller.addFilter("price", "ASICS"); // ["ASICS"]
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Filter name. |
| `value` | Yes | `*` | Value to be added to the filter. |
| `paramName` | No | `String` | Name of the parameter that will hold the filters.<br>`"filter"` by default. |

#### Controller.removeFilter()

Removes a value from a filter or the entire filter if no value was provided.

- If filter is currently stored in an array:
  + If a single value is provided, it is removed from the filter if it is in the array.
  + If an array is provided, all matching values are removed from the filter.
  + Passing an object is a wrong use case, don't do it.
- If values are stored in a plain Object:
  + If a single value is provided, it is considered an existing key of the filter object, and it is removed.
  + If a plain object is provided, common keys are removed from the filter.
  + Passing an array is a wrong use case, don't do it.
- If no value is passed, the entire filter is removed.
- In any other case, if the value matches the value of the filter, the entire filter is removed.
- Not found values have no effect.

**NOTICE:** If after removing a value/key, an array/object filter become empty, then the entire filter is removed from the filters list.

```javascript
controller.setFilter("brand", ["NIKE", "ADIDAS", "PUMA"]);
controller.removeFilter("brand"); // REMOVED

controller.setFilter("brand", ["NIKE", "ADIDAS", "PUMA"]);
controller.removeFilter("brand", "NIKE"); // ["ADIDAS", "PUMA"]
controller.removeFilter("brand", ["ADIDAS", "PUMA"]); // REMOVED

controller.setFilter("price", {gte: 10, lte: 100});
controller.removeFilter("price", "gte"); // {lte: 100}
controller.removeFilter("price", {lte: 100}); // REMOVED
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Field name. |
| `value` | No | `*` | |
| `paramName` | No | `String` | Name of the parameter that will hold the filters.<br>`"filter"` by default. |

#### Controller.getExclusion()

Works the same as `Controller.getFilter()` but for filters that explicitly exclude results (negative filters).

#### Controller.setExclusion()

Works the same as `Controller.setFilter()` but for filters that explicitly exclude results (negative filters).

#### Controller.addExclusion()

Works the same as `Controller.addFilter()` but for filters that explicitly exclude results (negative filters).

#### Controller.removeExclusion()

Works the same as `Controller.removeFilter()` but for filters that explicitly exclude results (negative filters).

#### Controller.registerWidget()

Registers a widget in the current controller instance.

```javascript
controller.registerWidget(myWidget);
```

**NOTICE:** Widget registration is a two-way binding. The widget gets registered in the controller and the controller gets registered in the widget.

##### Arguments

| Argument | Required | Type | Description | 
| :--- | :---: | :---: | :--- |
| `widget` | Yes | `Widget` | An instance of `Widget` (or any of its subclasses). |

#### Controller.registerWidgets()

Registers multiple widgets at the same time in the current controller instance.

```javascript
controller.registerWidgets([myInputWidget, myResultsWidget]);
```

**NOTICE:** Widget registration is a two-way binding. The widget gets registered in the controller and the controller gets registered in the widget.

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `widgets` | Yes | `Array` | An array of `Widget` (or any of its subclasses) instances. |  |

#### Controller.renderWidgets()

Makes registered widgets render themselves with the provided search response.

```javascript
controller.renderWidgets(response);
```

**NOTICE:** Triggers a `df:controller:renderWidgets` event on the controller when the `render()` method of all widgets has been executed.

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `response` | Yes | `Object` | A search response from Doofinder service. |

#### Controller.cleanWidgets()

Makes registered widgets clean themselves.

```javascript
controller.cleanWidgets();
```

**NOTICE:** Triggers a `df:controller:cleanWidgets` event on the controller when the `clean()` method of all widgets has been executed.

#### Controller.clean()

Resets status and clean widgets at the same time.

```javascript
controller.clean();

// The same as:
controller.reset();
controller.cleanWidgets();
```

#### Controller.serializeStatus()

Returns the current status of the controller as a URL querystring. Useful to save it somewhere and recover later.

```javascript
controller.serializeStatus();
// "query=running&query_name=match_and
// &filter%5Bcategories%5D%5B0%5D=Cardio&filter%5Bbrand%5D%5B0%5D=BH"
```

#### Controller.loadStatus()

Changes the status of the controller based on the value of the parameter provided, and performs a search request.

```javascript
controller.loadStatus(
  "query=running&query_name=match_and" +
  "&filter%5Bcategories%5D%5B0%5D=Cardio" +
  "&filter%5Bbrand%5D%5B0%5D=BH"
);
/*
{
  filter: {
    brand: ["BH"],
    categories: ["Cardio"]
  },
  query: "running",
  query_name: "match_and"
}
*/
```

##### Arguments

| Argument | Required | Type | Description | 
| :--- | :---: | :---: | :--- |
| `status` | Yes | `String` | Controller status obtained from `serializeStatus` |

#### Controller.on()

Registers a function that is executed when certain event is triggered on the controller.

```javascript
controller.on("df:controller:renderWidgets", myHandlerFn);
controller.on("event1 event2", myHandlerFn);
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Controller.one()

Registers a function that is executed when certain event is triggered on the controller the first time after this function is executed.

```javascript
controller.one("df:controller:renderWidgets", myHandlerFn);
controller.one("event1 event2", myHandlerFn);
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Controller.off()

Unregisters an event handler of this controller.

- If no handler is provided, all event handlers for the event name provided are unregistered for the current controller.
- If no handler and no event name are provided, all event handlers are unregistered for the current controller.

```javascript
controller.off("df:controller:renderWidgets", myHandlerFn);
controller.off("df:controller:renderWidgets");
controller.off();
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | No | `String` | Event name (or multiple events, space separated). |
| `handler` | No | `Function` | The callback function. |

#### Controller.trigger()

Triggers an event in the current controller.

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `args` | No | `Array` | Array of arguments to pass to the event handler. |

#### Events

You can listen and trigger several events on a `Controller` instance, here's a summary of them.

##### df:search

Triggered when a new search is done.

| Argument | Type | Description |
| :--- | :---: | :--- |
| `query` | `String` | Search terms for the current search. |
| `params` | `Object` | Search parameters defined in the controller for the new search. |

##### df:search:page

Triggered when a new page for the current search is requested.

| Argument | Type | Description |
| :--- | :---: | :--- |
| `query` | `String` | Search terms for the current search. |
| `params` | `Object` | Search parameters defined in the controller for the current search. |

##### df:refresh

Triggered when the current search is refreshed to get the first page again.

| Argument | Type | Description |
| :--- | :---: | :--- |
| `query` | `String` | Search terms for the current search. |
| `params` | `Object` | Search parameters defined in the controller for the current search. |

##### df:results:success

Triggered when a successful search response is received. This event is triggered after the response has been processed.

| Argument | Type | Description |
| :--- | :---: | :--- |
| `response` | `Object` | Valid response from the Doofinder service. |

##### df:results:error

Triggered when there is an error in the search request.

| Argument | Type | Description |
| :--- | :---: | :--- |
| `error` | `Object` | See below for details. |

###### Errors coming from the Doofinder servers

When the error comes from the server, it has a status code and, optionally, a message explaining the error.

```javascript
{
    statusCode: 400,
    error: "Invalid hashid"
}
```

###### Errors during the request

 Errors occurred during the request phase have an `error` key containing the instance of `Error` thrown.

 ```javascript
 {
    error: new Error("Whatever");
 }
 ```

##### df:results:end

Triggered when a successful search response for the last page of the current search is received. This event is triggered after the response has been processed.

| Argument | Type | Description |
| :--- | :---: | :--- |
| `response` | `Object` | Valid response from the Doofinder service. |

##### df:controller:renderWidgets

Triggered when the controller called the `render()` method of all widgets.

##### df:controller:cleanWidgets

Triggered when the controller called the `clean()` method of all widgets.

## Widgets Reference

### doofinder.widgets.Widget

This class provides the scaffolding of any widget, all widgets inherit from this class.

A widget is linked to:

- A DOM element.
- A `Controller`.

Widgets make extensive use of a DOM manipulation mini-library included in this package and called `dfdom`.

References to a widget's DOM _element_ are stored as an instance of `DfDomElement`.

#### constructor

The constructor receives a reference to a DOM element and an Object with options.

```javascript
var widget = new doofinder.widgets.Widget("#element", {});
```

**NOTICE:** Constructor signature and options may vary from a `Widget` subclass to another. Consult the reference of each class to know the proper values of the constructor and options object.

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `element` | Yes | `String` | CSS Selector. | `"#widget"` |
||| `Node` | Direct reference to a DOM Node. | `document.querySelector('#widget')` |
||| `DfDomElement` | Reference to a DOM node via `dfdom`. | `dfdom('#widget')` |
| `options` | No | `Object` | Options object. |  |

#### Widget.setElement()

This method is responsible of configuring the `element` passed to the constructor as the `element` attribute of the `Widget`.

```javascript
widget.setElement("#widget");
```

99.9% of time this method is used _as is_ but can be customized to assign a different container element to the widget.

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `element` | Yes | `String` | CSS Selector. | `"#widget"` |
||| `Node` | Direct reference to a DOM Node. | `document.querySelector('#widget')` |
||| `DfDomElement` | Reference to a DOM node via `dfdom`. | `dfdom('#widget')` |

#### Widget.setController()

Assigns a controller to the widget, so the widget can get access to the status of the search or directly manipulate the search through the controller, if needed.

This method is called by the `Controller` when a widget is registered. Usually a widget is only registered in one controller but you can extend this method to change this behavior.

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `controller` | Yes | `Controller` |||


#### Widget.init()

Initializes the widget. Intended to be extended in child classes, this method should be executed only once. This is enforced by the `initialized` attribute. You will want to add your own event handlers inside this method.

This method is called as part of the widget registration process that happens in the `Controller`.

#### Widget.render()

This method is responsible of the rendering of the widget with the search response received from the server.

The `Widget` base class does not have visual representation by default so this method just triggers the `df:widget:render` event.

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `response` | Yes | `Object` | Valid response from the Doofinder service. |

#### Widget.clean()

This method is responsible of the cleaning the HTML of the widget.

The `Widget` base class does not have visual representation by default so this method just triggers the `df:widget:clean` event.

#### Widget.on()

Registers a function that is executed when certain event is triggered on the widget.

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Widget.one()

Registers a function that is executed when certain event is triggered on the widget the first time after this function is executed.

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Widget.off()

Unregisters an event handler of a widget.

- If no handler is provided, all event handlers for the event name provided are unregistered for the current widget.
- If no handler and no event name are provided, all event handlers are unregistered for the current widget.

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | No | `String` | Event name (or multiple events, space separated). |
| `handler` | No | `Function` | The callback function. |

#### Widget.trigger()

Triggers an event on the widget.

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `args` | No | `Array` | Array of arguments to pass to the event handler. |

#### Events

##### df:widget:init

Triggered when the widget has ended its initialization (`init()` method called). The event handler receives no arguments.

##### df:widget:render

Triggered when the widget has finished rendering itself with the provided search response.

```javascript
widget.on("df:widget:render", function(response){
  // do something with the response
});
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `response` | Yes | `Object` | A search response from Doofinder service. |

##### df:widget:clean

Triggered when the widget has finished rendering itself. The event handler receives no arguments.

---

### doofinder.widgets.QueryInput

`Widget < QueryInput`

This is a special widget. It is linked to a HTML text input control and listens the `input` event so, when value changes due to user input, it uses its value to perform a new search via its registered controller(s).

This widget can be registered in multiple controllers at the same time so you could share the same text input and perform the same search in different search engines.

#### constructor

```javascript
var queryInput = new doofinder.widgets.QueryInput('#search', {
    captureLength: 4
});
```

##### Options

| Option | Required | Type | Values | Default | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `clean` | No | `Boolean` || `true` | If `true` the input is cleared when the widget is cleaned. |
| `captureLength` | No | `Number` || `3` | Minimum number of characters to type to perform a search request. |
| `typingTimeout` | No | `Number` || `1000` | Time in milliseconds the widget waits before triggering the `df:input:stop` event. |
| `wait` | No | `Number` || `42` | Time in milliseconds the widget waits before checking input to decide whether to perform a search or not.<br>High values (`400`) reduce the number of requests sent. |

#### Events

##### df:input:submit

This event is triggered when the user types <kbd>ENTER</kbd> on the search input control.

**NOTICE:** This event is not triggered for `TEXTAREA` controls.

```javascript
queryInput.on("df:input:submit", function(value){
  // do something with value
});
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `value` | Yes | `String` | Value of the input control. |

##### df:input:stop

This event is triggered after some time determined by the value `typingTimeout` in the widget options, when the user stops typing.

```javascript
queryInput.on("df:input:stop", function(value){
  // do something with value
});
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `value` | Yes | `String` | Value of the input control. |

##### df:input:none

This event is triggered during the value checking process, if the input changed from having a value to being empty. The event handler receives no arguments.

```javascript
queryInput.on("df:input:none", function(){
  // hide results?
});
```

---

### doofinder.widgets.Display

`Widget < Display`

This is a widget with actual rendering capabilities:

- It renders HTML inside its element node given a search response. Rendering is done with the [Mustache] engine.
- It populates variables and helpers (default and custom) to be used in the template.
- It cleans its element from unnecessary HTML code when the widget itself is cleaned.

#### constructor

Constructor now accepts options for templating.

```html
<script type="text/x-mustache-template" id="myTemplate">
  <ul>
    <li>{{#translate}}Hello!{{/translate}}</li>
    <li>Meaning of life is {{meaningOfLife}}!</li>
  {{#results}}
    <li>{{#bold}}{{title}}{{/bold}}</li>
  {{/results}}
  </ul>
</script>
```

```javascript
var display = new doofinder.widgets.Display("#myDiv", {
  template: document.getElementById('myTemplate').innerHTML,
  templateFunctions: {
    bold: function() {
      return function(text, render) {
        return "<b>" + render(text) + "</b>";
      }
    }
  },
  templateVars: {
    meaningOfLife: 42
  },
  translations: {
    "Hello!": "Hola!"
  }
});
```

##### Options

| Option | Required | Type | Default | Description |
| :--- | :---: | :---: | :---: | :--- |
| `template` | Yes | `String` || HTML template to render the search response. |
| `templateFunctions` | No | `String` | `{}` | An Object whose keys are the name of [Mustache] template helpers. |
| `templateVars` | No | `String` | `{}` | An Object whose keys are the name of [Mustache] variables. |
| `translations` | No | `String` | `{}` | An Object mapping strings to be replaced by other values when found inside the default `translate` helper. |

##### Default Template

```mustache
{{#results}}
  <a href="{{link}}" class="df-card">{{title}}</a>
{{/results}}
```

##### Default Template Variables

Some template variables are included by default in the rendering context:

| Variable | Type | Description |
| :--- | :---: | :--- |
| `is_first` | `Boolean` | Indicates if the response being rendered is for the first page of a search. |
| `is_last` | `Boolean` | Indicates if the response being rendered is for the last page of a search. |

##### Default Template Functions

Some template functions are included by default in the rendering context:

| Function | Description |
| :--- | :--- |
| `translate` | If a match is found in the `translations` dictionary of the widget, the text inside the helper is replaced by its translation. |

---

### doofinder.widgets.ScrollDisplay

`Widget < Display < ScrollDisplay`

You can use this class to render subsequent responses for the same search one after another by appending HTML instead of replacing it. HTML is replaced for the first page of a search only.

When the user performs scrolling and reaches the end of the results, a new search page is automatically requested.

**IMPORTANT:** Scrolling content inside a `<div>` (or similar node) requires width / height being restricted so the content overflows the container instead of the latter adapts to its content. Also, setting `overflow-x` and `overflow-y` properties in CSS will enforce these rules.

#### constructor

```mustache
<style>
.container {
  width: 400px;
  height: 600px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
<div class="container" id="scroller">
  <div class="container-header">Search Results</div>
  <ul class="container-content"></ul>
</div>
<script type="text/x-mustache-template" id="scroller-template">
  {{#results}}
    <li><a href="{{link}}" class="df-card">{{title}}</a></li>
  {{/results}}
</script>
```

```javascript
var resultsWidget = new doofinder.widgets.ScrollDisplay("#scroller", {
  contentElement: ".container-content",
  template: document.getElementById('scroller-template').innerHTML
});
```

##### Options

This widgets receives the same options as `Display`, plus:

| Option | Required | Type | Default | Description |
| :--- | :---: | :---: | :---: | :--- |
| `contentElement` | No | `String` | `null` | Reference to a child node of the widget's element. By default the widget's element node contains the HTML rendered by the widget. |
| `offset` | No | `Number` | `300` | Distance in pixels to the bottom of the content. As soon as the scrolled content reaches this value, a new results page is requested. |
| `throttle` | No | `Number` | `16` | Time in milliseconds to wait between scroll checks. This value limits calculations associated to the `scroll` event. |
| `horizontal` | No | `Boolean` | `false` | If `true`, scroll calculations are done for horizontal scrolling. By default calculations are done for vertical scrolling. |

**IMPORTANT:** Don't rely on the widget's `element` attribute to do stuff with the container, if you use the `contentElement` option, that node will internally become the `element` node. To access the container always use the `container` attribute.

#### Events

##### df:widget:scroll

This event is triggered each time scrolling calculations are made.

```javascript
resultsContainer.on("df:widget:scroll", function(scrollTop, direction){
  // Do something with scrollTop and direction.
});
```

| Argument | Type | Values |Description |
| :--- | :---: | :---: | :--- |
| `scrollTop` | `Number` || The number of pixels the content is scrolled vertically. |
| `direction` | `String` | `"up", "down"` | The direction of the scrolling. |

---

### doofinder.widgets.TermsFacet

`Widget < Display < TermsFacet`

This widget allows filtering search results by certain text values of a field. When a term is clicked, the widget forces its controller to perform a new search filtered by the value of the facet.

#### constructor

```javascript
var facet = new doofinder.widgets.TermsFacet("#brandFilter", "brand");
```

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `element` | Yes | `String` | CSS Selector. |
||| `Node` | Direct reference to a DOM Node. |
||| `DfDomElement` | Reference to a DOM node via `dfdom`. |
| `facet` | Yes | `String` | Name of the facet as returned by the server in the facet specification. |
| `options` | No | `Object` | Options object. |

#### Default Templates

###### template

This is the default template of the widget.

```mustache
{{#terms}}
  <div class="df-term" data-facet="{{name}}" data-value="{{key}}"
      {{#selected}}data-selected{{/selected}}>
    <span class="df-term__value">{{key}}</span>
    <span class="df-term__count">{{doc_count}}</span>
  </div>
{{/terms}}
```

There're some `data` attributes that must be present for the widget to work properly:

| Attribute | Description |
| :--- | :--- |
| `data-facet` | Holds the name of the current facet as defined in Doofinder. |
| `data-value` | Holds the value of the term. |
| `data-selected` | Indicates whether the term is selected or not. |

The variables available for each term are:

| Variable | Description |
| :--- | :--- |
| `name` | Holds the name of the current facet as defined in Doofinder. |
| `key` | Holds the value of the term. |
| `selected` | Indicates whether the term is selected or not. |
| `doc_count` | Indicates the number of results when filtering the current search results by this term. |

#### Events

Apart from the default events, this widget triggers the following events.

##### df:term:click

Triggered when a term is clicked for the current widget.

```javascript
widget.on("df:term:click", function(facetName, facetValue, isSelected){
  // Do something with data
});
```

| Argument | Type | Description |
| :--- | :---: | :--- |
| `facetName` | `String` | Name of the facet as defined in Doofinder. |
| `facetValue` | `String` | Value of the term. |
| `isSelected` | `Boolean` | Indicates whether the facet is selected or not. |

---

### doofinder.widgets.RangeFacet

`Widget < Display < RangeFacet`

This widget provides an interface to filter results by a numeric value through a slider control.

**NOTICE:** Slider is managed by the excelent [noUiSlider] library but not all options are supported.

**NOTICE:** Slider needs `doofinder.css` to work.

#### constructor

```javascript
var rangeWidget = new doofinder.widgets.RangeFacet("#price", {
    format: formatCurrency
});
```

##### Options

| Option | Required | Type | Values | Default | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `pips` | No | `undefined` | `undefined` | `undefined` | Makes the widget render its own _pips_ due to a buggy behavior in noUiSlider. |
||| `Boolean` | `false` || Disables _pips_. |
||| `Object` |||  |
| `format` | No | `Function` ||| Function to format numeric values as strings. |

##### Default Templates

**NOTICE:** If you change the `df-slider` CSS class, remember to update CSS to match the new one.

```mustache
<div class="df-slider" data-facet="{{name}}"></div>
```

| Variable | Type | Description |
| :--- | :---: | :--- |
| `name` | `String` | Name of the facet as defined in Doofinder. |

#### RangeFacet.get

Gets the current range selected in the slider.

```javascript
var r = rangeWidget.get();
var start = r[0];
var end = r[1];
```

#### RangeFacet.set

Sets the range selected in the slider.

```javascript
rangeWidget.set([10, 100]);
```

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `range` | Yes | `Array` | 2-item array of numbers. | `[10, 100]` |

#### Events

Apart from the default events, this widget triggers the following events.

##### df:range:change

Triggered when the range set in the slider changed by user input.

```javascript
// min [-----------|start|------------------|end|-------] max
widget.on("df:range:change", function(value, range){
  console.log(value.start);
  console.log(value.end);
  console.log(range.min);
  console.log(range.max);
});
```

| Argument | Type | Description |
| :--- | :---: | :--- |
| `value` | `Object` | Current selected range. |
| `range` | `Object` | Valid range. |

## Session Reference

A `Session` is used to store user data. User (session) data may be persisted in different ways, depending on the _store_ class being used.

Currently there are two _store_ classes available:

- [`ObjectSessionStore`](#doofindersessionobjectsessionstore)
- [`CookieSessionStore`](#doofindersessioncookiesessionstore)

### doofinder.session.Session

Class that represents a user session key/value store persisted somewhere.

**NOTICE:** A `session_id` key with a valid value is always generated if it doesn't already exists when you access the session to get or set data. This is enforced by design but you can override session id if you want.

#### constructor

```javascript
var session = new doofinder.session.Session(
  new doofinder.session.CookieSessionStore("myCookie")
);
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `store` | Yes | `ISessionStore` | A valid storage instance. |

#### Session.get()

Gets the value of the specified key. Optionally accepts a default value to be returned if the specified key does not exist.

```javascript
var session = new doofinder.session.Session(
  new doofinder.session.ObjectSessionStore({"query": "hello"})
);
session.get("query", "nothing"); // "hello"
session.get("other", "nothing"); // "nothing"
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | A key name. |
| `defaultValue` | No | `*` | A default value to be returned. |

#### Session.set()

Saves a value in the session by assigning it to the specified key.

```javascript
var session = new doofinder.session.Session(
  new doofinder.session.ObjectSessionStore()
);
session.set("query", "hello");
session.get("query", "nothing"); // "hello"
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | A key name. |
| `value` | Yes | `*` | A value to be saved. |

#### Session.del()

Deletes the specified key from the session store.

```javascript
var session = new doofinder.session.Session(
  new doofinder.session.ObjectSessionStore({"query": "hello"})
);
session.del("query");
session.get("query", "nothing"); // "nothing"
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | A key name. |

#### Session.clean()

Removes all session data.

```javascript
var session = new doofinder.session.Session(
  new doofinder.session.ObjectSessionStore({"query": "hello"})
);
session.clean();
session.get("query", "nothing"); // "nothing"
```

#### Session.exists()

Checks whether the search session exists or not by searching for a `session_id` key defined in the _store_ class and returns a Boolean value.

```javascript
var session = new doofinder.session.Session(
  new doofinder.session.ObjectSessionStore()
);
session.exists(); // false
session.get("session_id", "nothing"); // "320sadd09fdfsedfab"
session.exists(); // true
session.set("session_id", "something");
session.get("session_id", "nothing"); // "something"
```

**NOTICE:** A `session_id` key is always generated in the _store_ if it doesn't already exists when you access the store to get or set data. This is enforced by design but you can override session id if you want.

---

### doofinder.session.ObjectSessionStore

`ISessionStore < ObjectSessionStore`

Store to hold session data as a plain `Object`.

#### constructor

```javascript
var store = new doofinder.session.ObjectSessionStore({
  key: "value"
});
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `data` | No | `Object` | Initial data. |

---

### doofinder.session.CookieSessionStore

`ISessionStore < CookieSessionStore`

Store that holds session data in a browser cookie.

#### constructor

```javascript
var store = new doofinder.session.CookieSessionStore(cookieName, {
  expiry: 1
});
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `cookieName` | Yes | `String` | A name for the cookie. |
| `options` | No | `Object` | Options object. |

##### Options

| Option | Required | Type |  Default | Description |
| :--- | :---: | :---: | :---: | :--- |
| `prefix` | No | `String` | `""` | Prefix to be added to the cookie name. |
| `expiry` | Yes | `Number` | `1/24` | Duration of the cookie in days. 1 hour by default. |

## Stats Reference

### doofinder.Stats

Helper class to wrap calls to the Doofinder stats API endpoint using the `Client` and `Session` classes.

#### constructor

```javascript
var stats = new doofinder.Stats(client, session);
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `client` | Yes | `Client` | An instance of `Client`. |
| `session` | Yes | `Session` | An instance of `Session`. |

#### Stats.setCurrentQuery()

Sets current search terms in the search session.

```javascript
stats.setCurrentQuery("red car");
```

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `query` | Yes | `String` | Search terms. |

**WARNING:** This should be called ONLY if the user has performed a search. That's why this is usually called when the user has stopped typing in the search box.

#### Stats.registerSession()

Registers the session in Doofinder stats if not already registered. It marks the session as registered synchronously to short-circuit other attempts while the request is in progress. If an error occurs in the stats request the session is marked as unregistered again.

```javascript
var registered = stats.registerSession(function(err, res){
  // Do something in case of error or successful response
});
```

This method returns a `Boolean` value saying if the session was registered or not (for instance if it was already registered).

**WARNING:** This should be called ONLY if the user has performed a search. That's why this is usually called when the user has stopped typing in the search box.

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `callback` | No | `Function` | Method to be called when the response or an error is received. |

#### Stats.registerClick()

Registers a click on a search result for the specified search query.

```javascript
stats.registerClick("abcd3434...", "red car", function(err, res){
  // Do something in case of error or successful response
});
stats.registerClick("abcd3434...", null, function(err, res){
  // Do something in case of error or successful response
});
stats.registerClick("abcd3434...");
```

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `dfid` | Yes | `String` | Internal id of the result in Doofinder |
| `query` | No | `String` | Search terms. If not defined, is obtained from the session. |
| `callback` | No | `Function` | Method to be called when the response or an error is received. |

#### Stats.registerCheckout()

Registers a checkout if session exists. This method returns a `Boolean` to determine whether the checkout was registered or not.

```javascript
var registered = stats.registerCheckout(function(err, res){
  // Do something in case of error or successful response
});
```

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `callback` | No | `Function` | Method to be called when the response or an error is received. |

#### Stats.registerBannerEvent()

Registers an event for a banner.

```javascript
stats.registerBannerEvent("display", 1234, function(err, res){});
stats.registerBannerEvent("click", 1234, function(err, res){});
```

| Argument | Required | Type | Values | Description |
| :--- | :---: | :---: |:---: | :--- |
| `eventName` | Yes | `String` | `display` | Use to register the event of a banner being displayed to the user. |
|||| `click` | Used to register the click of a user on a banner. |
| `bannerId` | Yes | `Number` || Id of the banner in Doofinder. |
| `callback` | No | `Function` || Method to be called when the response or an error is received. |

## How To

### Configure facet widgets dynamically

Facets defined in Doofinder for a search engine can be easily retrieved by requesting the search engine's options through an instance of `Client`.

For each _terms_ facet you will get something like this:

```json
{
  "visible": true,
  "type": "terms",
  "size": 20,
  "name": "brand",
  "label": "brand",
  "field": "brand.facet",
  "es_definition": {
    "terms": {
      "size": 20,
      "field": "brand.facet"
    }
  }
}
```

When dealing with the options response to dynamicly configure facets, you will only have to take some fields into account:

| Field | Type | Values | Description |
| :--- | :---: | :---: | :--- |
| `name` | `String` || Machine name of the facet. |
| `type` | `String` | `"terms"` | For _terms_ facet this value is fixed. |
| `size` | `Number` || Maximum number of terms the server will return for this facet. |
| `label` | `String` || Humanized name of the facet. |
| `visible` | `Boolean` || Indicates whether this filter should be available for the user or is for your app's internal use only. |

For instance, you could do this:

```html
<div id="brand"></div>
```

```javascript
client.options(function(err, options){
  options.facets.forEach(function(facet){
    if (facet.type === 'terms') {
      var elementId = "#" +  facet.name; // "#brand", for instance
      controller.registerWidget(
        new doofinder.widgets.TermsFacet(elementId, facet.name)
      );
    }
  });
});
```

For a _range_ facet you would get something like this:

```json
{
  "visible": true,
  "type": "range",
  "ranges": [{
    "from": 0
  }],
  "name": "best_price",
  "label": "Price",
  "field": "best_price",
  "es_definition": {
    "range": {
      "ranges": [{
          "from": 0
      }],
      "field": "best_price"
    }
  }
}
```


[grunt]: https://gruntjs.com
[doofinder]: https://www.doofinder.com
[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[doofinder admin]: https://app.doofinder.com/admin
[widgets]: #widgets
[search api]: https://www.doofinder.com/support/developer/api/search-api
[mustache]: http://mustache.github.io/
[nouislider]: https://refreshless.com/nouislider/
