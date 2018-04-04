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


## doofinder.widgets.QueryInput

This is a special widget. It is linked to one or more HTML text input or textarea controls and listens the `input` event so, when value changes due to user input, it uses its value to perform a new search via its registered controller(s).
 
This widget can also be registered in multiple controllers at the same time so you could share the same text input and perform the same search in different search engines.

### Instantiating the class


```javascript
var queryInput = new doofinder.widgets.QueryInput('#search', {
    captureLength: 4
});
```

#### options

| Option | Required | Type | Values | Default | Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `clean` | No | `Boolean` || `true` | If `true` the input is cleared when the widget is cleaned. |
| `captureLength` | No | `Number` || `3` | Minimum number of characters to type to perform a search request. |
| `typingTimeout` | No | `Number` || `1000` | Time in milliseconds the widget waits before triggering the `df:input:stop` event. |
| `wait` | No | `Number` || `42` | Time in milliseconds the widget waits before checking input to decide whether to perform a search or not.<br>High values (`400`) reduce the number of requests sent. |
| `delayedEvents` | No | `Object` ||| Each key is the name of a custom event you want to trigger in the future after the user has stopped typing. Values are the delay in ms. See `df:input:stop` for more info. |

##### Delayed events

The user can define custom events to be triggered after some time the user has stopped typing

Delayed events example: The event `df:user:bored` will be triggered after 10 seconds of stop typing with the value of the search box as an argument.
``` javascript
var queryInput = new doofinder.widgets.QueryInput('#q', {
  delayedEvents: {
    'df:user:bored': 10000 // 10 s
  }
});

queryInput.on('df:user:bored', function(value){
  console.log("the user is bored. He typed "+value+" 10 seconds ago");
});
```

### Using the class

#### Events

| Event | Triggered when ... | Triggered with the arguments ...|
| :--- | :--- | :--- |
| `df:input:stop` | ...`typyingTimeout` seconds without typing has passed (i.e. the user stops typing) | ... `value` value of input control |
| `df:input:none` | ... the value of the search box has changed to being empty | ... no arguments |
| `df:input:targetChanged` | ... multiple inputs are attached to the widget and the current active input changes | `input` (The current active input) and `previousInput`(the previously active input) |

#### Extra attributes of QueryInput

   - `currentElement` the currently active input: it's value can be changed with the `.val()` method, but it doesn't trigger a search
  
  ```javascript
  var input = myQueryInput.currentElement;
  input.val('pipo'); //changes value of search box, but doesn't trigger a search
  ```
  
  - `value` the value of the active input. Changing it triggers a search:
  
  ```javascript
  myQueryInput.value = 'choco boy'; // changes value of search box and triggers search for "choco boy"
  ```
