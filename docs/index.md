---
layout: default
---

<!-- MarkdownTOC depth="2" autolink="true" autoanchor="false" bracket="round" -->

- [The overview](index#the-overview)
  - [Basic building blocks: client, widgets & controller](index#basic-building-blocks-client-widgets-controller)
- [The Client](client.md#the-client)
  - [Instantiating the class](client.md#instantiating-the-class)
  - [Using the class](client.md#using-the-class)
  - [Reference](client.md#reference)
- [The Controller](controller.md#the-controller)
  - [Instantiating the class](controller.md#instantiating-the-chass)
  - [Registering widgets](controller.md#registering-widgets)
  - [Using the class](controller.md#using-the-class)
  - [Reference](controller.md#reference)
  - [Errors](controller.md#errors)
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

## The overview

### Basic building blocks: client, widgets & controller

Doofinder has three basic building blocks

#### The client

This class is the only one that actually talks to doofinder search server. It's responsible for obtaining options from the search server, making search requests or stats-related requests .

#### The widgets

These are meant for users to interact with:
  - *a search input* that provides the search text to be sent to the server by the client
  - *the search results* displayed in some DOM component (scrolled or not). When clicked on these search results, the client is instructed to send stats info to the server. When scrolled, the client is instructed to fetch next page of results
  - a side pane of possible filters to apply to the search

#### The controller

This class holds everything together. It takes care of making the **client**  do the search request when a user types something into the **search input widget** , and of feeding search resuts obtained into the **results widget**.

### One quick example

This should work out of the box. You can see the basic behavior of the building blocks

```html
<html>
  <head>
    <!-- Javascript -->
    <script src="//cdn.jsdelivr.net/npm/doofinder@latest/dist/doofinder.min.js"></script>
    <!-- CSS -->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/doofinder@latest/dist/doofinder.css">
  </head>
  <body>
    <input type="text" id="search">
    <div id="results"></div>
    <script>
      // the client that talks to the search server
      var client = new doofinder.Client("dd485e41f1758def296e1bc7377f8ea7", {zone: 'eu1'});
      // this widget 'listen' the terms typed in the input type
      var queryInput = new doofinder.widgets.QueryInput('#search');
      // this widget display at the "results" div the results obtained
      var display = new doofinder.widgets.Display("#results");
      // the controller to bind them all
      var controller = new doofinder.Controller(client);
      controller.registerWidgets([queryInput, display]);
    </script>
  </body>
</html>
```


## Widgets Reference

### doofinder.widgets.Widget

This class provides the scaffolding of any widget, all widgets inherit from this class.

A widget is linked to:

- A DOM element.
- A `Controller`.

Widgets make extensive use of a DOM manipulation mini-library included in this package and called `dfdom`.

References to a widget's DOM _element_ are stored as an instance of `DfDomElement`.

#### constructor

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `element` | Yes | `String` | CSS Selector. | `"#widget"` |
||| `Node` | Direct reference to a DOM Node. | `document.querySelector('#widget')` |
||| `DfDomElement` | Reference to a DOM node via `dfdom`. | `dfdom('#widget')` |
| `options` | No | `Object` | Options object. |  |

#### Widget.setElement()

##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `element` | Yes | `String` | CSS Selector. | `"#widget"` |
||| `Node` | Direct reference to a DOM Node. | `document.querySelector('#widget')` |
||| `DfDomElement` | Reference to a DOM node via `dfdom`. | `dfdom('#widget')` |

#### Widget.setController()


##### Arguments

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `controller` | Yes | `Controller` |||


#### Widget.init()

#### Widget.render()

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `response` | Yes | `Object` | Valid response from the Doofinder service. |

#### Widget.clean()



#### Widget.on()

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Widget.one()


##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Widget.off()

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | No | `String` | Event name (or multiple events, space separated). |
| `handler` | No | `Function` | The callback function. |

#### Widget.trigger()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `args` | No | `Array` | Array of arguments to pass to the event handler. |


---

### doofinder.widgets.QueryInput



#### constructor



##### Options


#### Events

##### df:input:stop

This event is triggered after some time determined by the value `typingTimeout` in the widget options, when the user stops typing.

```javascript
queryInput.on("df:input:stop", function(value){
  // do something with value
});
```

If you want to perform extra actions without changing the default `df:input:stop` event, use `options.delayedEvents`:

```javascript
var queryInput = new doofinder.widgets.QueryInput('#q', {
  delayedEvents: {
    'df:user:bored': 10000 // 10s
  }
});

queryInput.on("df:user:bored", function(value){
  console.log('The user is bored!');
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

##### df:input:targetChanged

This event is triggered when multiple inputs are attached to the widget and the current active input changes from one to another.

```javascript
queryInput.on("df:input:targetChanged", function(input, previousInput){
  // do something with value
});
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `input` | Yes | `HTMLElement` | Current active input. |
| `previousInput` | Yes | `HTMLElement` | Previously active input. |

#### Programming with QueryInput

##### Access the current active input

A user only can type in one input at the same time so the current input can be easily identified. You can get the currently active input via the `currentElement` attribute.

```javascript
var input = myQueryInput.currentElement;
```

##### Set value programmatically

To set the value of the input you can use the `currentElement` attribute:

```javascript
myQueryInput.currentElement.val('Hello');
```

But that doesn't trigger a search.

Instead, use the `value` property:

```javascript
myQueryInput.value = 'Hello';
```

---

### doofinder.widgets.Display

`Widget < Display`

This is a widget with actual rendering capabilities:

- It renders HTML inside its element node given a search response. Rendering is done with the [Mustache] engine.
- It populates variables and helpers (default and custom) to be used in the template.
- It cleans its element from unnecessary HTML code when the widget itself is cleaned.

#### constructor



##### Options


##### Default Template




---

### doofinder.widgets.ScrollDisplay

`Widget < Display < ScrollDisplay`



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
var stats = new doofinder.Stats(client);
```

##### Arguments

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `client` | Yes | `Client` | An instance of `Client`. |

#### Stats.registerSession()

Registers the session in Doofinder stats if not already registered. It marks the session as registered synchronously to short-circuit other attempts while the request is in progress. If an error occurs in the stats request the session is marked as unregistered again.

```javascript
var registered = stats.registerSession(sessionId, function(err, res){
  // Do something in case of error or successful response
});
```

This method returns a `Boolean` value saying if the session was registered or not (for instance if it was already registered).

**WARNING:** This should be called ONLY if the user has performed a search. That's why this is usually called when the user has stopped typing in the search box.

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `sessionId` | Yes | `String` | The anonymous user session id. |
| `callback` | No | `Function` | Method to be called when the response or an error is received. |

#### Stats.registerClick()

Registers a click on a search result for the specified search query.

This methods accepts two different signatures depending if you use the Doofinder internal ID for documents or your database ID and a valid datatype in Doofinder.

##### Using the Doofinder internal ID (dfid)

```javascript
stats.registerClick(sessionId, "abcd3434...", "red car", function(err, res){
  // Do something in case of error or successful response
});
stats.registerClick(sessionId, "abcd3434...", null, function(err, res){
  // Do something in case of error or successful response
});
stats.registerClick(sessionId, "abcd3434...");
```

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `sessionId` | Yes | `String` | The anonymous user session id. |
| `dfid` | Yes | `String` | Internal id of the result in Doofinder |
| `query` | No | `String` | Search terms. If not defined, it's sent as the empty string. |
| `callback` | No | `Function` | Method to be called when the response or an error is received. |

##### Using your database ID

```javascript
stats.registerClick(sessionId, 10, "product", "red car", function(err, res){
  // Do something in case of error or successful response
});
stats.registerClick(sessionId, 10, "product", null, function(err, res){
  // Do something in case of error or successful response
});
stats.registerClick(sessionId, 10, "product", "some query");
```

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `sessionId` | Yes | `String` | The anonymous user session id. |
| `id` | Yes | `String` | Database ID of the result in your system. |
| `datatype` | Yes | `String` | Type of document in Doofinder. |
| `query` | No | `String` | Search terms. If not defined, it's sent as the empty string. |
| `callback` | No | `Function` | Method to be called when the response or an error is received. |

#### Stats.registerCheckout()

Registers a checkout if session exists. This method returns a `Boolean` to determine whether the checkout was registered or not.

```javascript
var registered = stats.registerCheckout(sessionId, function(err, res){
  // Do something in case of error or successful response
});
```

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `sessionId` | Yes | `String` | The anonymous user session id. |
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


[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[doofinder]: https://www.doofinder.com
[mustache]: http://mustache.github.io/
[nouislider]: https://refreshless.com/nouislider/
[search api]: https://www.doofinder.com/support/developer/api/search-api
[widgets]: #widgets
