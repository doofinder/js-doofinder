---
layout: default
---

{% include_relative toc.md %}

## Widgets

These classes handle human interaction with the controller which in turn instructs the client to act accordingly and uses widgets back to render results. For instance, the search box the user types the search terms in is binded to a [QueryInput widget class](queryInput.md), and the search results are displayed on some DOM element using some kind of [Display widget class](display.md). Also the results may display a filter side panel which accepts user input to filter results, the latter would have a [TermsFacet widget](display.md#doofinder-widgets-termsfacet) itself.

### Basic mechanics

The mechanics of the thing is  more or less as it follows

  - **Instantiate the widget class** That class can be a [QueryInput  widget](queryInput.md) (meant for user input), or a [Display widget](display.md) (meat for displaying results). _The class is always binded to some DOM element_
  - **Set the widget's controller** That is, registering the `Widget` class into a [controller class](controller.md), which will do the general plumbing between [QueryInput widgets](queryInput.md), the [client class](client.md) and the [Display widgets](display.md):
  - **The controller acts on the widget or react to it**
    * If the widget is a [QueryInput widget](queryInput.md): Every time a user types in the associated search box, the [controller class](controller.md) uses the [client class](client.md) to fetch search results from the search server
    * If the widget is a [Display widget](display.md): Every time search results come from the search server, the [controller class](controller.md) calls widget's `render()` method to display the results
    
To summarize, _every widget is linked to_:
  - a DOM element.
  - a `Controller`
    
### Instantiating the widget

Just a reference to a DOM element and an optional options object

``` javascript
var widget = new doofinder.widgets.Widget('#element', {}); // all widget types inherit from this
```

**NOTICE:**Options vary from one widget type to another.

### Using the widgets.

These methods are shared by all `widget` classes and inheriting classes.

##### Widget.setElement()

Set's the DOM element the widget is binded to

``` javascript
widget.setElement('#element_id');
```


##### Widget.setController()

Assigns a controller to the widget, so the controller knows what the widget is doing (via widget signals), and the widget can get access to the status of the search or directly manipulate the search via the controller, if needed.

This method is called by the `Controller` when a widget is registered.

##### Widget.init()

Initializes the widget. This method is called as part of the widget registration process that happens in the `Controller`

##### Widget.render()

This method is responsible of the rendering of the widget with the search response received from the server (it has to be a `Display` type widget, the base class does not have a visual representation by efault)

##### Widget.clean()

This method is responsible of the cleaning the HTML of the widget.

The `Widget` base class does not have visual representation by default so this method just triggers the `df:widget:clean` event.

#### Event management

##### Widget.on()

Registers a function that is executed when certain event is triggered on the widget.

##### Widget.one()

Registers a function that is executed when certain event is triggered on the widget the first time after this function is executed.

##### Widget.off()

Unregisters an event handler of a widget.

- If no handler is provided, all event handlers for the event name provided are unregistered for the current widget.
- If no handler and no event name are provided, all event handlers are unregistered for the current widget.

##### Widget.trigger()

Triggers an event on the widget, along with an array of arguments to be passed to the handler of the event

#### Events shared by all widgets

| Event | Triggered when ... | Triggered with the arguments ... |
| :--- | :--- | :--- |
| `df:widget:init` | ... the widget has ended its initialization | |
| `df:widget:render` | ... the widget has finished rendering itself with the provided search response | `response` the search response object |
| `df:widget:clean` | ... the widget has finished rendering itself ||


### Reference

#### Constructor 

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `element` | Yes | `String` | CSS Selector. | `"#widget"` |
||| `Node` | Direct reference to a DOM Node. | `document.querySelector('#widget')` |
||| `DfDomElement` | Reference to a DOM node via `dfdom`. | `dfdom('#widget')` |
| `options` | No | `Object` | Options object. |  |

#### Widget.setElement()

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `element` | Yes | `String` | CSS Selector. | `"#widget"` |
||| `Node` | Direct reference to a DOM Node. | `document.querySelector('#widget')` |
||| `DfDomElement` | Reference to a DOM node via `dfdom`. | `dfdom('#widget')` |

#### Widget.setController()

| Argument | Required | Type | Description | Sample |
| :--- | :---: | :---: | :--- | :--- |
| `controller` | Yes | `Controller` |||

#### Widget.render()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `response` | Yes | `Object` | Valid response from the Doofinder service. |

#### Widget.init()

No arguments. 

#### Widget.clean()

No arguments.

#### Widget.on()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Widget.one()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `handler` | Yes | `Function` | The callback function. |

#### Widget.off()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | No | `String` | Event name (or multiple events, space separated). |
| `handler` | No | `Function` | The callback function. |

#### Widget.trigger()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `eventName` | Yes | `String` | Event name (or multiple events, space separated). |
| `args` | No | `Array` | Array of arguments to pass to the event handler. |
  
  
### dofinder.widgets.ScrollDisplay

`Widget < Display < ScrollDisplay`

You can use this class to render subsequent responses for the same search one after another by appending HTML instead of replacing it. HTML is replaced for the first page of a search only.

When the user performs scrolling and reaches the end of the results, a new search page is automatically requested.

**IMPORTANT:** Scrolling content inside a `<div>` (or similar node) requires width / height being restricted so the content overflows the container instead of the latter adapts to its content. Also, setting `overflow-x` and `overflow-y` properties in CSS will enforce these rules.


