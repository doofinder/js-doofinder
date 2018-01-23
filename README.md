[![Build Status](https://api.travis-ci.org/doofinder/js-doofinder.svg?branch=master)](https://travis-ci.org/doofinder/js-doofinder)

# Doofinder Library

A.K.A. `js-doofinder`, or just `doofinder`, this library makes easy to perform requests to Doofinder's search service and customize the way you present results.

<!-- MarkdownTOC depth="2" autolink="true" autoanchor="false" bracket="round" -->

- [Installation](#installation)
    - [NPM](#npm)
    - [Bower](#bower)
    - [CDN](#cdn)
- [TL;DR](#tldr)
- [Quick Start](#quick-start)
- [Documentation](#documentation)

<!-- /MarkdownTOC -->


## Installation

The library can be installed via package managers or directly pointing to a file in jsDelivr's CDN.

The package offers simple CSS you can obtain from the `dist` directory. It will help you to build a scaffolding of your project with little effort.

### NPM

```shell
$ npm install doofinder
```

### Bower

```shell
$ bower install doofinder
```

### CDN

You can include the library directly in your website:

```html
<!-- Javascript -->
<script src="//cdn.jsdelivr.net/npm/doofinder@latest/dist/doofinder.min.js"></script>
<!-- CSS -->
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/doofinder@latest/dist/doofinder.css">
```

## TL;DR

If you only want to know how this is structured, without the details, here we go.

The library provides:

- A `Client` class to perform requests to the [Doofinder] service.
- A `Controller` class which provides an easy-to-use wrapper for the client and holds `Widget` instances that will process the response from the service.
- A collection of widgets which render HTML _somewhere_ given a JSON search response, and provide a user interface to present results or refine search.
- A collection of utilities, like DOM manipulation, introspection, throttling… and that kind of stuff.

## Quick Start

The project includes a demo you can use as inspiration. To take a look and see things you can do with it:

1. Download the entire project from Github.
2. Install [Grunt] if not previously installed.
3. From the root of the project:
    1. install dependencies with `$ npm install`.
    2. Run the demo server with `$ grunt serve`.
4. Open `http://localhost:8008` in your browser.

The demo markup is inside `index.html` and the related Javascript code can be found at `demo/demo.js`.

**NOTICE:** The demo uses a test search engine but you can use a different one, just change the value of the `HASHID` variable you will find inside `index.html`.

**IMPORTANT:** [Doofinder] protects API calls with [CORS]. If you change the `HASHID` variable defined in `index.html` you will have to allow `localhost` for your search engine in [Doofinder Admin].

## Documentation

**(Work In Progress)**

[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[doofinder admin]: https://app.doofinder.com/admin
[doofinder]: https://www.doofinder.com
[grunt]: https://gruntjs.com
