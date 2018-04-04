---
layout: default
---

{% include_relative toc.md %}

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

