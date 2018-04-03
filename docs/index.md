---
layout: default
---

<!-- MarkdownTOC depth="2" autolink="true" autoanchor="false" bracket="round" -->

- [The overview](index.md#the-overview)
  - [Basic building blocks: client, widgets & controller](index.md#basic-building-blocks-client-widgets-controller)
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
- [The widgets](widgets.md)
  - [Basic mechanics](widgets.md#basic-mechanics)
  - [INstantiating the widget](widgets.md#instantiating-the-widget)
  - [Using the widgets](widgets.md#using-the-widgets)
  - [Reference](widgets.md#reference)
- [Query Input Widgets](queryInput.md)
  - [Instantiating the class](queryInput.md#instantiating-the-class)
  - [Using the class](queryInput.md#using-the-class)
- [Display widgets](display.md)
  - [Instantiating the class](display.md#instantiating-the-class)
- [Scroll Display widget](display.md#doofinderwidgetsscrolldisplay)
  - [Instantiating the class](display.md#scrolldisplay-instantating-the-class)
- [Terms Facet class](display.md#doofinderwidgetstermsfacet)
  - [Instantiating the class](termsfacet-instantiating-the-class)
- [Range Facet class](display.md#doofinderwidgetrangefacet)
  - [Instantiating the class](display.md#rangefacet-instantiating-the-class)
  - [Using the class](display.md#rangefacet-using-the-class)
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




- A DOM element.
- A `Controller`.

Widgets make extensive use of a DOM manipulation mini-library included in this package and called `dfdom`.

References to a widget's DOM _element_ are stored as an instance of `DfDomElement`.



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
