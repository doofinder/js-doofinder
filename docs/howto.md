---
layout: default
---

{% include_relative toc.md %}

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
