{% include_relative toc.md %}

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
