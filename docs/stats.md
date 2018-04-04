---
layout: default
---

<!-- MarkdownTOC depth="2" autolink="true" autoanchor="false" bracket="round" -->

- [The overview](index.md#the-overview)
  - [Basic building blocks: client, widgets & controller](index.md#basic-building-blocks-client-widgets--controller)
- [The Client](client.md#the-client)
  - [Instantiating the class](client.md#instantiating-the-class)
  - [Using the class](client.md#using-the-class)
  - [Reference](client.md#reference)
- [The Controller](controller.md#the-controller)
  - [Instantiating the class](controller.md#instantiating-the-class)
  - [Registering widgets](controller.md#registering-widgets)
  - [Using the class](controller.md#using-the-class)
  - [Reference](controller.md#reference)
  - [Errors](controller.md#errors)
- [The widgets](widgets.md)
  - [Basic mechanics](widgets.md#basic-mechanics)
  - [Instantiating the widget](widgets.md#instantiating-the-widget)
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
  - [Instantiating the class](display.md#termsfacet-instantiating-the-class)
- [Range Facet class](display.md#doofinderwidgetrangefacet)
  - [Instantiating the class](display.md#rangefacet-instantiating-the-class)
  - [Using the class](display.md#rangefacet-using-the-class)
- [The session](session.md)
  - [Instantiating the class](session.md#instantiating-the-class)
  - [Using the class](session.md#using-the-class)
  - [Reference](session.md#reference)
  - [doofinder.session.ObjectSessionStore](session.md#doofindersessionobjectsessionstore)
  - [doofinder.session.CookieSessionStore](session.md#doofindersessioncookiesessionstore)
- [The Stats](stats.md)
  - [Instantiating the class](stats.md#instantiating-the-class)
  - [Using the class](stats.md#using-the-stats)
  - [Reference](stats.md#reference)
- [How To](howto.md)
  - [Configure facet widgets dynamically](howto.md#configure-facet-widgets-dynamically)

<!-- /MarkdownTOC -->


## The Stats

This is a helper class you can use to register stats info to the search server.

### Instantiating the class

You need to provide a ['client'](client.md) class in the constructor, so the `doofinder.Stats` class knows how to communicate to the search server.

``` javascript
var myClient = new doofinder.Client('dd485e41f1758def296e1bc7377f8ea7', {zone: 'eu1'});
var stats = new doofinder.Stats(myClient);
```

### Using the class

The standard cycle would be

  * **Register the session**: Tells the search server a unique session is about to start and it's identified by some unique identificator. You should do this once per every user per checkout.
  * **Register product clicking** Every time a user clicks on some product link as a result of a search request, you should send that info so you can later check the most clicked products and stuff
  * **Register banner events** Every time a user sees o clicks on a custom banner you've set in you search results.
  * **Register checkouts** Every time a user get to the checkout page you should notify that so you can later know how well you search is performing in terms of making easier to buy!. _Once a checkout is done, a new session should be registered_

#### Stats.registerSession()

Registers the session in Doofinder stats if not already registered. It marks the session as registered synchronously to short-circuit other attempts while the request is in progress. If an error occurs in the stats request the session is marked as unregistered again.

```javascript
var registered = stats.registerSession(sessionId, function(err, res){
  // Do something in case of error or successful response
});
```

This method returns a `Boolean` value saying if the session was registered or not (for instance if it was already registered).

**WARNING:** This should be called ONLY if the user has performed a search. That's why this is usually called when the user has stopped typing in the search box.

#### Stats.registerClick()

Registers a click on a search result for the specified search query.

This methods accepts two different signatures depending if you use the Doofinder internal ID for documents or your database ID and a valid datatype in Doofinder.

```javascript
/* Use doofinder internal id (dfid field) */
stats.registerClick(sessionId, "35xxxx4df5725401645bb03a35510722@product@d88ba83a49694e66446653c9c4d00c7e", "red car", function(err, res){
  // Do something in case of error or successful response
});

/* Use your database id and datatype */
stats.registerClick(sessionId, 10, "product", "red car", function(err, res){
  // DO something in case of error or successful response
});
```

#### Stats.registerBannerEvent()

Register `'display'` or `'click'` event for a banner displayed for certain search results (as configured in doofinder control panel)

``` javascript
var bannerId = 3321;
stats.registerBannerEvent("display", bannerId, function(err, res){});
stats.registerBannerEvent("click", bannerId, function(err, res){});
```

### Reference

#### Constructor

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `client` | Yes | `Client` | An instance of `Client`. |


#### Stats.registerSession()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `sessionId` | Yes | `String` | The anonymous user session id. |
| `callback` | No | `Function` | Method to be called when the response or an error is received. |

#### Stats.registerClick()

  * Using doofinder's internal id (`dfid`):
  
  | Argument | Required | Type | Description |
  | :--- | :---: | :---: | :--- |
  | `sessionId` | Yes | `String` | The anonymous user session id. |
  | `dfid` | Yes | `String` | Internal id of the result in Doofinder |
  | `query` | No | `String` | Search terms. If not defined, it's sent as the empty string. |
  | `callback` | No | `Function` | Method to be called when the response or an error is received. |

  * Using your database id and datatype
  
  | Argument | Required | Type | Description |
  | :--- | :---: | :---: | :--- |
  | `sessionId` | Yes | `String` | The anonymous user session id. |
  | `id` | Yes | `String` | Database ID of the result in your system. |
  | `datatype` | Yes | `String` | Type of document in Doofinder. |
  | `query` | No | `String` | Search terms. If not defined, it's sent as the empty string. |
  | `callback` | No | `Function` | Method to be called when the response or an error is received. |

#### Stats.registerBannerEvent()

| Argument | Required | Type | Values | Description |
| :--- | :---: | :---: |:---: | :--- |
| `eventName` | Yes | `String` | `display` | Use to register the event of a banner being displayed to the user. |
|||| `click` | Used to register the click of a user on a banner. |
| `bannerId` | Yes | `Number` || Id of the banner in Doofinder. |
| `callback` | No | `Function` || Method to be called when the response or an error is received. |
