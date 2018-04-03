## The Controller

This is the class that keep client and widgets together, and allow them to react to each other.

This class is aimed to easily search and display search results in a browser, managing search status and providing search results pagination & filtering capabilities.

You shouldn't need to use any of the other classes (`client`, `widget`) own methods for the standard use of this library.

### Instantiating the class

This class uses a [Client](client.md#the-client) to retrieve search results, and some [widgets](widgets.md#the-widgets) to paint results in the user interface and to obtain search terms from user's input.

Has to be instantiated with a `Client` instance:

```javascript
controller = new doofinder.Controller(client);
```

### Registering widgets

Once instantiated, you probably want to register widgets to the `controller` so human interaction is possible, otherwise, you could only do search requests programatically.

For instance, you can register a `queryInput` widget so the `controller` can know when an user types anything in the search box and instruct the `client` to do the apropiate requests to the search server, and you can register a `display` widget so the `controller` ca use a `display` widget  to render results. You can do that with the `registerWidgets` method:

```javascript
controller.registerWidgets([inputWidget, displayWidget])
```


### Using the class

#### The search status

When you perform a search, there is a set of parameters that define how the search is done, whether the results are transformed or not, etc ...  These are a few of these parameters, but you can check all of them in the [doofinder]'s [Search API]

  - `rpp` Number of results to be returned in every search request
  - `filter` filters to apply to the search
  - `transformer` whether the results are transformed or not.

  ... and a lot more. Whenever we talk about "search status" we talk about doing search requests with some specific set of search parameters

#### Properties reflecting you search's status

These are standard properties of the `controller` class that reflect some of you search status properties

| Property | Type | Description |
| :--- | :---: | :--- |
| `hashid` | `String` | Shortcut to get the `hashid` of the search engine being queried. |
| `query` | `String` | Current search' search terms |
| `params` | `Object` | Any extra parameters sent to the server, like `rpp`, `page` and `query_name`. |
| `isFirstPage` | `Boolean` | `true` if the last page requested is the first page. |
| `isLastPage` | `Boolean` | `true` if the last page requested is the last page. |
| `lastPage` | `Number` | The last page of the current search that you can request. If the current search has `100` results are you are getting `10` results per page, the last page is `10`. |
| `queryCounter` | `Number` | Requests counter, used to avoid processing a response that arrived too late. |
| `requestDone` | `Boolean` | Used internally to control if the first page of the current search has been requested. |

You access  this properties with the standard javascript dot notation. For instance, to access last used query

```javascript
var last_used_query = controller.query
```

#### Basic Searching

##### Controller.search()

Performs a new search request, removing any non-default parameters and resetting parameters to the defaults (i.e. page number reset to `1`).

```javascript
controller.search("shirt", {filter: {brand: "NIKE"}}); // notice the already filtered search request
```

You can add all search params specified in [doofinder]'s [Search API]

When the results are received from the search server:
  - The `controller` renders those results in all its registered display widgets.
  - The `controller` triggers the `df:results:success` signal with the search response itself


##### Controller.getNextPage()

Given that a previous search request was done, performs a new search request to get the next page of results for the current status.

##### Controller.getPage()

Given that a previous search request was done, performs a new search request to get certain page of results for the current status.

##### Controller.refresh()

Redo last search , requesting first page of results.

##### Controller.reset()

Resets everything as defined during class instantiation  and optionally forces search query terms and parameters to be set. Because it is a reset aimed to perform a new search, `page` has always value `1` when executing this.


#### Filtering/Excluding from the search results

You can refine your search by filtering or excluding results according to certain criteria.

```javascript
controller.search("black shoes"); //initial search
controller.setFilter("brand", "NIKE"); // set filter only NIKE shoes
controller.refresh(); // redo "black shoes" search but filtered this time
```

Once you set a filter/exclusion filter, you can use `controller.refresh()` to redo the search with the filter applied.

##### Controller.setFilter()/Controller.setExclusion()

Sets the value of a filter (or **exclusion filter**) to be used on searches.

```javascript
// terms
controller.setFilter("brand", "NIKE"); // only products from the "NIKE" brand
controller.setFilter("brand", ["ADIDAS", "PUMA"]) // products with brand "ADIDAS" or "PUMA"
// range
controller.setFilter("price", {gte: 10}) // only products whose price is greater or equal to 10
```

```javascript
controller.setExclusion("brand", "NIKE"); // only products NOT FROM the "NIKE" brand
```

##### Controller.addFilter()/Controller.addExclusion()

_Extends_ the current value of a filter or exclusion filter with the provided value. The method have sensible defaults

```javascript
controller.setFilter("brand", "NIKE"); // only products from the "NIKE" brand
controller.addFilter("brand", "ADIDAS"); // only products from the "NIKE" or "ADIDAS" brand
```

##### Controller.removeFilter()/Controller.removeExclustion()

If value is provided, remove part of the filter or exclusion filter matching that value, otherwise remove the filter completely

```javascript
controller.setFilter("brand", ["NIKE", "ADIDAS"]); // products with brand NIKE or ADIDAS
controller.removeFilter("brand", "NIKE"); // products with brand ADIDAS
controller.removeFilter("brand"); // removes brand filter completely

controller.setFilter("price", {gte: 10, lte: 100}); // products with price greater than 10 and less than 100
controller.removeFilter("price", {lte: 100}); // proucts with price greater than 10
```

##### Controller.getFilter()/Controller.getExclusion()

Retrieves the value of some specific filter set on the search.

```javascript
controller.getFilter('brand');
```

#### Changing/Controlling other search params

Besides filters and page number, other params can modify how the `controller` performs the search


##### Controller.getParam()

Returns the value of a parameter from the current search status.

```javascript
controller.getParam("transformer");
```

##### Controller.setParam()

Sets the value of a parameter in the current search status.

```javascript
controller.setParam("transformer", null);
```

##### Controller.removeParam()

Removes a parameter from the current search status.

```javascript
controller.removeParam("transformer");
```

#### The search status
As said before the "search status" is the set of search parameters that represent a particular search, including:
  - page: the page number of the results
  - filter: the filters applied to the search
  - query: the search terms
  - exclude: negative filters applied to the search
  ... and some more

There are some methods related to the _'search status_ :

##### Controller.reset()

You saw this before. just resets everything to the search parameters specified during controller construction and optionally sets new search parameters

##### Controller.clean()

Equivalent to

```javascript
controller.reset();
controller.cleanWidgets();
```

##### Controller.serializeStatus()

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

#### Managing widgets

As said before, `widgets` are how a user interact with the search server. The `controller` needs to register them in order to know how to display the results. The widget type determines what the controller is to do with it.

##### Controller.registerWidget()

Registers a widget in the controller instance.

```javascript
controller.registerWidget(myWidget);
```

##### Controller.registerWidgets()

Registers several widgets in the controller instance.

```javascript
controller.registerWidgets([myInputWidget, myResultsWidget]);
```

##### Controller.cleanWidgets()

Runs the `clean()` method on every registered widget

#### Event management

The `Controller` instance can listen to a number of events:

##### Controller.on()

Registers a function that is executed when certain event is triggered on the controller.

``` javascript
controller.on("df:results:success", function(response) { console.log('received response');} );
controller.on("event1 event2", myHandlerFunction);
```

##### Controller.one()

Registers a function that is executed only the first time certain event is triggered

``` javascript
controller.one("event1 event2", myHandlerFn);
```

##### Controller.off()

Unregisters an event handler of this controller.

``` javascript
controller.on("df:results:success", firstHandler);
controller.on("df:results:success", secondHandler);
controller.on("df:results:success", thirdHandler);
controller.on("df:search", otherHandler):

controller.off("df:results:success", firstHandler); // Unregister 'firstHandler'
controller.off("df:results:sucess"); // unregister everything that was binded to "df:results:success"
controller.off(); // unregister every callback for every event
```

##### Controller.trigger()

Triggers an event in the current controller, along with an array of arguments to be passed to the event handler

``` javascript
// triggers "df:search", the handler receives the arguments "red shoes" and {filter:{}}
controller.trigger("df:search", ['red shoes', {filter:{}}]);
```



##### Events:

| Event | Triggered when ... | Triggered with the arguments ...|
| :--- | :--- | :--- |
| `df:search` |  ...a new search is done. | ...`query`(The search terms) and `params` (The search parameters defined for the search) |
| `df:search:page` | ...a new page for the current search is requested. | ... same as `df:search` |
| `df:refresh` | ...the current search is refreshed to get the first page again. | ... same as `df:search` |
| `df:results:success` | ...a successful search response is received and has been processed. | ...`response` (The response from the Doofinder service. |
| `df:results:end` | ...a successful search response _of the last page of results_ is received and has been processed. | ...same as `df:results:success` |
| `df:results:discarded` | ... a search response is discarded because a more recent one has already been received | ... same as `df:results:success` |
| `df:results:error` | ...there's an error in the search request | ...`error` (object describing the error) . see [#errors-coming-from-the-doofinder-servers](errors from server) and [#errors-during-the-request](errors during the request)
| `df:controller:renderWidgets` | ... the controller called the `render()` method of registered widgets. | ... same as `df:results:success` |
| `df:controller:cleanWidgets` | ... the controller called the `clean()` method of registered widgets. ||


### Reference

#### Constructor

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `client` | Yes | `doofinder.Client` | Search client instance. |
| `params` | No | `Object` | Parameters to be added to all requests by default. |

Read the [Search API] reference to learn more about available parameters.

#### Controller.search()

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `query` | Yes | `String` | Search terms |
| `params` | No | `Object` | Parameters sent in the URL. | `{page: 1, rpp: 20}`

Read the [Search API] reference to learn more about available parameters.

#### Controller.getPage()

| Argument | Required | Type | Description
| :--- | :---: | :---: | :--- |
| `page` | Yes | `Integer` | Number of the page of results to fetch.

#### Controller.reset()

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `query` | No | `String` | Search terms | `"something"`
| `params` | No | `Object` | Parameters sent in the URL. | `{page: 1, rpp: 20}`

Read the [Search API] reference to learn more about available parameters.

#### Controller.getParam()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Name of the parameter to retrieve. |

#### Controller.setParam()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Name of the parameter to set. |
| `value` | Yes | `*` | Value of the parameter to set.<br>Can be anything serializable in a URL querystring. |

#### Controller.removeParam()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Name of the parameter to remove. |

#### Controller.getFilter()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Filter name. |
| `paramName` | No | `String` | Name of the parameter that will hold the filters.<br>`"filter"` by default. |

#### Controller.setFilter()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Filter name. |
| `value` | Yes | `*` | If is a string, it's added as a one-item array.<br>Otherwise, it's added with no modifications. |
| `paramName` | No | `String` | Name of the parameter that will hold the filters.<br>`"filter"` by default. |

#### Controller.addFilter()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Filter name. |
| `value` | Yes | `*` | Value to be added to the filter. |
| `paramName` | No | `String` | Name of the parameter that will hold the filters.<br>`"filter"` by default. |

#### Controller.removeFilter()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | Field name. |
| `value` | No | `*` | |
| `paramName` | No | `String` | Name of the parameter that will hold the filters.<br>`"filter"` by default. |

#### Controller.registerWidget()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `widget` | Yes | `Widget` | An instance of `Widget` (or any of its subclasses). |

**NOTICE:** Widget registration is a two-way binding. The widget gets registered in the controller and the controller gets registered in the widget.

#### Controller.registerWidgets()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `widgets` | Yes | `Array` | An array of `Widget`  (or any of its subclasses) type elements. |

**NOTICE:** Widget registration is a two-way binding. The widget gets registered in the controller and the controller gets registered in the widget.


#### Controller.renderWidgets()

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `widgets` | Yes | `Array` | An array of `Widget` (or any of its subclasses) instances. |  |

#### Controller.clean()

#### Controller.serializeStatus()

#### Controller.loadStatus()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `status` | Yes | `String` | Controller status obtained from `serializeStatus` |

#### Controller.on()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Controller.one()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Controller.off()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | No | `String` | Event name (or multiple events, space separated). |
| `handler` | No | `Function` | The callback function. |

#### Controller.trigger()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `args` | No | `Array` | Array of arguments to pass to the event handler. |

### Errors

#### Coming from the Doofinder servers

When the error comes from the server, it has a status code and, optionally, a message explaining the error.

```javascript
{
    statusCode: 400,
    error: "Invalid hashid"
}
```

#### Errors during the request

 Errors occurred during the request phase have an `error` key containing the instance of `Error` thrown.

 ```javascript
 {
    error: new Error("Whatever");
 }
 ```
