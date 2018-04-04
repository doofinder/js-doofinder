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


## How To...

Hopefully this part of the documentation will gradually grow larger :-)

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
