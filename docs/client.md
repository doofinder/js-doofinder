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

## The Client

This is the class that handles all comunication with the search server. It uses [Doofinder]'s [Search API].

### Instantiating the class

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

You have to supply either  `zone` or `apiKey` , depending of where you're using the library.

### Using the class

Most of the times you won't use this class directly, instead you'll use it through the `Controller` methods, but if you feel in the hacking mood..

#### Client.search()

Performs a search request to the [Doofinder] [Search API] and passes any error or response to the provided callback function.

```javascript
client.search("something", processResponse);
```

#### Client.options()

Performs a request to get preferences for the search engine from the [Doofinder] server and passes options to the provided callback function.

```javascript
client.options(processOptions);
```

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

#### Client.request()

Performs a HTTP(S) GET "raw" request to the given resource of the [Doofinder] [Search API] and passes any error or response to the provided callback function.

```javascript
client.request("/5/search?query=something", function(err, res){
  return (err ? processError(err) : processResponse(res));
});
```


### Reference

#### Constructor

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `hashid` | Yes | `String` | 32-char, unique id of a search engine. |
| `options` | Yes | `Object` |

##### Options

These are the possible options for the `options` dictionary

One of `zone` and `apiKey` options are required. If both are set, search zone is extracted from `apiKey`.


| Option | Required | Type | Values | Default | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `zone` | Yes\* | `String` | `eu1`<br>`us1` || Search zone. | `eu1` |
| `apiKey` | Yes\* | `String` ||| Secret to authenticate requests. |
| `address` | No | `String` ||| Search server address.<br>For development purposes. |
| `version` | No | `String` || `"5"` | Search API version.<br>For development purposes. |

#### Client.search()

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `query` | Yes | `String` | Search terms |
| `params` | No | `Object` | Parameters sent in the URL. | `{page: 1, rpp: 20}`
| `callback` | Yes | `Function` | Callback to be called. |

Read the [Search API] reference to learn more about available parameters.

#### Client.options()

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `suffix` | No | `String` | Optional suffix to add to the request URL, like the domain of the current page. | `localhost` |
| `callback` | Yes | `Function` | Callback to be called. |

#### Client.stats()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Name of the event you want to send. |
| `params` | Yes* | `Object` | Parameters sent in the URL.<br>Most events need parameters but it depends on the event. |
| `callback` | No | `Function` | Callback to be called. |

Read the [Search API] reference to learn more about computing stats.

#### Client.request()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `resource` | Yes | `String` | API endpoint. Parameters are sent in the URL. |
| `callback` | Yes | `Function` | Callback to be called. |
