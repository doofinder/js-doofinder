---
layout: default
---

<!-- MarkdownTOC depth="2" autolink="true" autoanchor="false" bracket="round" -->

- [The overview](index#the-overview)
  - [Basic building blocks: client, widgets & controller](index#basic-building-blocks-client-widgets-controller)
- [The Client](the-client#the-client)
  - [Instantiating the class](the-client#instantiating-the-class)
  - [Using the class](the-client#using-the-class)
  - [Reference](the-client#client-reference)
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
