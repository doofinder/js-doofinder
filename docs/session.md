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


## The Session


A `Session` object is used to store user data. 


### Instantiating the class

When creating an session, the mechanism for persistent data vary depending on the _store_ class being used during instantiation

Currently there are two _store_ classes available:

- [`ObjectSessionStore`](#doofindersessionobjectsessionstore)
- [`CookieSessionStore`](#doofindersessioncookiesessionstore)

``` javascript
var session = new doofinder.session.Session(
  new doofinder.session.CookieSessionStore("myCookie")
);
```


**NOTICE:** A `session_id` key with a valid value is always generated if it doesn't already exists when you access the session to get or set data. This is enforced by design but you can override session id if you want.

### Using the class

It's pretty straightforward, setting and getting values from some permanent storage container.

The `session_id` attribute , if not set, is generated automatically when requested.

#### Session.get()

Gets the value of the specified key. Optionally accepts a default value to be returned if the specified key does not exist.

```javascript
var session = new doofinder.session.Session(
  new doofinder.session.ObjectSessionStore({"query": "hello"})
);
session.get("query", "nothing"); // "hello"
session.get("other", "nothing"); // "nothing"
```

#### Session.set()

Saves a value in the session by assigning it to the specified key.

```javascript
var session = new doofinder.session.Session(
  new doofinder.session.ObjectSessionStore()
);
session.set("query", "hello");
session.get("query", "nothing"); // "hello"
```

#### Session.del()

Deletes the specified key from the session store.

```javascript
var session = new doofinder.session.Session(
  new doofinder.session.ObjectSessionStore({"query": "hello"})
);
session.del("query");
session.get("query", "nothing"); // "nothing"
```

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


### Reference

#### Constructor

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `store` | Yes | `ISessionStore` | A valid storage instance. |

#### Session.get()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | A key name. |
| `defaultValue` | No | `*` | A default value to be returned. |

#### Session.set()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | A key name. |
| `value` | Yes | `*` | A value to be saved. |

#### Session.del()

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `key` | Yes | `String` | A key name. |

#### Session.clean()

No arguments

#### Session.exists()

No arguments

---

### doofinder.session.ObjectSessionStore

`ISessionStore < ObjectSessionStore`

Store to hold session data as a plain `Object`.

```javascript
var store = new doofinder.session.ObjectSessionStore({
  key: "value"
});
```

##### Constructor

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `data` | No | `Object` | Initial data. |

---

### doofinder.session.CookieSessionStore

`ISessionStore < CookieSessionStore`

Store that holds session data in a browser cookie.


```javascript
var store = new doofinder.session.CookieSessionStore(cookieName, {
  expiry: 1
});
```

##### Constructor

| Argument | Required | Type | Description |
| :--- | :---: | :---: | :--- |
| `cookieName` | Yes | `String` | A name for the cookie. |
| `options` | No | `Object` | Options object. |

###### Options

| Option | Required | Type |  Default | Description |
| :--- | :---: | :---: | :---: | :--- |
| `prefix` | No | `String` | `""` | Prefix to be added to the cookie name. |
| `expiry` | Yes | `Number` | `1/24` | Duration of the cookie in days. 1 hour by default. |

