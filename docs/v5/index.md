---
layout: default
---

{% include_relative toc.md %}

## Overview

### Basic building blocks: client, widgets & controller

Doofinder has three basic building blocks

#### The client

This class is the only one that actually talks to doofinder search server. It's responsible for obtaining options from the search server, making search requests or stats-related requests .

#### The widgets

These are meant for users to interact with:
  - *a search input* that provides the search text to be sent to the server by the client
  - *the search results* displayed in some DOM component (scrolled or not). When clicked on these search results, the client is instructed to send stats info to the server. When scrolled, the client is instructed to fetch next page of results
  - a side pane of possible filters to apply to the search

#### The controller

This class holds everything together. It takes care of making the **client**  do the search request when a user types something into the **search input widget** , and of feeding search resuts obtained into the **results widget**.

### One quick example

This should work out of the box. You can see the basic behavior of the building blocks

```html
<html>
  <head>
    <!-- Javascript -->
    <script src="//cdn.jsdelivr.net/npm/doofinder@latest/dist/doofinder.min.js"></script>
    <!-- CSS -->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/doofinder@latest/dist/doofinder.css">
  </head>
  <body>
    <input type="text" id="search">
    <div id="results"></div>
    <script>
      // the client that talks to the search server
      var client = new doofinder.Client("dd485e41f1758def296e1bc7377f8ea7", {zone: 'eu1'});
      // this widget 'listen' the terms typed in the input type
      var queryInput = new doofinder.widgets.QueryInput('#search');
      // this widget display at the "results" div the results obtained
      var display = new doofinder.widgets.Display("#results");
      // the controller to bind them all
      var controller = new doofinder.Controller(client);
      controller.registerWidgets([queryInput, display]);
    </script>
  </body>
</html>
```

- A DOM element.
- A `Controller`.

Widgets make extensive use of a DOM manipulation mini-library included in this package and called `dfdom`.

References to a widget's DOM _element_ are stored as an instance of `DfDomElement`.


[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[doofinder]: https://www.doofinder.com
[mustache]: http://mustache.github.io/
[nouislider]: https://refreshless.com/nouislider/
[search api]: https://www.doofinder.com/support/developer/api/search-api
[widgets]: #widgets
