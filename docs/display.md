---
layout: default
---

{% include_relative toc.md %}

## doofinder.widgets.Display

These kind of widgets are ment to display content inside some DOM element and may also be able to accepts input from the user through the rendered content

`Widget < Display`

 A widget that inherit from this class can render content:
 
   - It renders HTML inside its element node given a search response. Rendering is done with the [Mustache] engine.
  - It populates variables and helpers (default and custom) to be used in the template.
  - It cleans its element from unnecessary HTML code when the widget itself is cleaned.
  
### Instantiatin the class

Constructor now accepts options for templating.

```html
<script type="text/x-mustache-template" id="myTemplate">
  <ul>
    <li>{{#translate}}Hello!{{/translate}}<>
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
  
#### options

| Option | Required | Type | Default | Description |
| :--- | :---: | :---: | :---: | :--- |
| `template` | Yes | `String` | see [Defaut Template](#default-template)| HTML template to render the search response. |
| `templateFunctions` | No | `Object` | see [Default Template Functions](#default-template-functions) | An Object whose keys are the name of [Mustache] template helpers. |
| `templateVars` | No | `Object` | See [Default Template Variables](#default-template-variables)| An Object whose keys are the name of [Mustache] variables. |
| `translations` | No | `Object` | `{}` | An Object mapping strings to be replaced by other values when found inside the default `translate` helper. |

##### <a name="default-template"></a>Default Template

```mustache
{{#results}}
  <a href="{{link}}" class="df-card">{{title}}</a>
{{/results}}
```

##### <a name="default-template-variables"></a>Default Template Variables

| Variable | Type | Description |
| :--- | :---: | :--- |
| `is_first` | `Boolean` | Indicates if the response being rendered is for the first page of a search. |
| `is_last` | `Boolean` | Indicates if the response being rendered is for the last page of a search. |

##### <a name="default-template-functions"></a>Default Template Functions

| Function | Description |
| :--- | :--- |
| `translate` | If a match is found in the `translations` dictionary of the widget, the text inside the helper is replaced by its translation. |


## doofinder.widgets.ScrollDisplay

`Widget < Display < ScrollDisplay`

You can use this class to render subsequent responses for the same search one after another by appending HTML instead of replacing it. HTML is replaced for the first page of a search only.

When the user performs scrolling and reaches the end of the results, a new search page is automatically requested.
 
**IMPORTANT:** Scrolling content inside a `<div>` (or similar node) requires width / height being restricted so the content overflows the container instead of the latter adapts to its content. Also, setting `overflow-x` and `overflow-y` properties in CSS will enforce these rules.


### Scroll Display: Instantiating the class

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

#### Options

This widgets receives the same options as `Display`, plus:

| Option | Required | Type | Default | Description |
| :--- | :---: | :---: | :---: | :--- |
| `contentElement` | No | `String` | `null` | Reference to a child node of the widget's element. By default the widget's element node contains the HTML rendered by the widget. |
| `offset` | No | `Number` | `300` | Distance in pixels to the bottom of the content. As soon as the scrolled content reaches this value, a new results page is requested. |
| `throttle` | No | `Number` | `16` | Time in milliseconds to wait between scroll checks. This value limits calculations associated to the `scroll` event. |
| `horizontal` | No | `Boolean` | `false` | If `true`, scroll calculations are done for horizontal scrolling. By default calculations are done for vertical scrolling. |

**IMPORTANT:** Don't rely on the widget's `element` attribute to do stuff with the container, if you use the `contentElement` option, that node will internally become the `element` node. To access the container always use the `container` attribute.

### Scroll Display: Using the class

#### Events

| Event | Triggered when ... | Triggered with the arguments ... |
| :--- | :--- | :--- |
| `df:widget:scroll` | ... each time scrolling calculations are made | `scrollTop` (number of pixels the content is scrolled vertically), and `direction` (direction of scrolling: "up" or "down")|


## doofinder.widgets.TermsFacet

`Widget < Display < TermsFacet`

This widget allows filtering search results by certain text values of a field. When a term is clicked, the widget forces its controller to perform a new search filtered by the value of the facet.

### TermsFacet: Instantiating the class

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

#### Default Template

```mustache
{{#terms}}
  <div class="df-term" data-facet="{{name}}" data-value="{{key}}"
      {{#selected}}data-selected{{/selected}}>
    <span class="df-term__value">{{key}}</span>
    <span class="df-term__count">{{doc_count}}</span>
  </div>
{{/terms}}
```

#### Template requirements

The widget must be able to find some `data` attributes in the rendered html that indicates him certain facet/terms properties:

| Attribute | Must ... |
| :--- | :--- |
| `data-facet` | ...holds the name of the current facet as defined in Doofinder. |
| `data-value` | ...holds the value of the term. |
| `data-selected` | ...Indicates whether the term is selected or not. |

#### The received data

As you can see in the default template example, the terms widget will provide the template  with the following data.

| Variable | Description |
| :--- | :--- |
| `name` | Holds the name of the current facet as defined in Doofinder. |
| `terms` | list of terms for that facet. each of one with the `key`, `selected` and `doc_count`  values (see below)|
| `key` | Holds the value of the term. |
| `selected` | Indicates whether the term is selected or not. |
| `doc_count` | Indicates the number of results when filtering the current search results by this term. |


## doofinder.widgets.RangeFacet

`Widget < Display < RangeFacet`

This widget provides an interface to filter results by a numeric value through a slider control.

**NOTICE:** Slider is managed by the excelent [noUiSlider] library but not all options are supported.

**NOTICE:** Slider needs `doofinder.css` to work.

### RangeFacet: Instantiating the class

```javascript
var rangeWidget = new doofinder.widgets.RangeFacet("#price", {
    format: formatCurrency
});
```

#### Options

| Option | Required | Type | Values | Default | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `pips` | No | `undefined` | `undefined` | `undefined` | Makes the widget render its own _pips_ due to a buggy behavior in noUiSlider. |
||| `Boolean` | `false` || Disables _pips_. |
||| `Object` |||  |
| `format` | No | `Function` ||| Function to format numeric values as strings. |

#### Default Template

**NOTICE:** If you change the `df-slider` CSS class, remember to update CSS to match the new one.

```mustache
<div class="df-slider" data-facet="{{name}}"></div>
```

#### The received data

| Variable | Type | Description |
| :--- | :---: | :--- |
| `name` | `String` | Name of the facet as defined in Doofinder. |


### RangeFacet.get

Gets the current range selected in the slider.

```javascript
var r = rangeWidget.get();
var start = r[0];
var end = r[1];
```

### RangeFacet.set

Sets the range selected in the slider.

```javascript
rangeWidget.set([10, 100]);
```

### RangeFacet: Using the class

#### Events

| Event | Triggered when ... | Triggered with the arguments ... |
| :--- | :--- | :--- |
| `df:range:set` | ... the slider range is changed by user | `value` (object with `start` `end` keys representing the starting and ending selected values), and `range` (object with `min` and `max` keys representing range's minumum and maximum)|


