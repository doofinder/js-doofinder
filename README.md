[![Build Status](https://api.travis-ci.org/doofinder/js-doofinder.svg?branch=master)](https://travis-ci.org/doofinder/js-doofinder)

# Doofinder Library

A.K.A. `js-doofinder`, or just `doofinder`, this library makes easy to perform requests to Doofinder's search service and customize the way you present results.

<!-- MarkdownTOC depth="2" autolink="true" autoanchor="false" bracket="round" -->

- [Installation](#installation)
    - [Yarnpkg](#yarn)
    - [NPM](#npm)
    - [CDN](#cdn)
- [TL;DR](#tldr)
- [Quick Start](#quick-start)
- [Documentation](#documentation)

<!-- /MarkdownTOC -->


## Installation

The library can be installed via package managers or directly pointing to a file in jsDelivr's CDN.

### Yarnpkg (Recommended)

```shell
$ yarn add doofinder
```

### NPM

```shell
$ npm install doofinder
```

#### ESM

```js
import { Client } from 'doofinder';
```

#### CommonJS

```js
const { Client } = require('doofinder/commonjs');
```

### CDN

You can include the library directly in your website:

```html
<!-- Javascript -->
<script src="//cdn.jsdelivr.net/npm/doofinder@latest/dist/doofinder.min.js"></script>
```

## TL;DR

If you only want to know how this is structured, without the details, here we go.

The library provides:

- A `Client` class to perform requests to the [Doofinder] service.
- A `Query` class which provides an easy-to-use object to prepare the queries to the Doofinder `Client` before sending anything.
- A `Result` class to wrap the response from the server and access to the data through easy to use methods.
- A `ClientRepo` singleton that holds a pool of Doofinder `Client` in each zone and helps instantiating them.

## Quick Start

The project includes a demo you can use as inspiration. To take a look and see things you can do with it:

1. Download the entire project from Github.
2. Make sure you've got Node 10.x running in your system.
3. From the root of the project:
    1. install dependencies with `$ yarn install` or `$ npm install`.
4. To run the tests, execute: `$ yarn test`.

The demo markup is inside `index.html` and the related Javascript code can be found at `playground/demo.js`.

**NOTICE:** The demo uses a test search engine but you can use a different one, just change the value of the `HASHID` variable you will find inside `index.html`.

**IMPORTANT:** [Doofinder] protects API calls with [CORS]. If you change the `HASHID` variable defined in `index.html` you will have to allow `localhost` for your search engine in [Doofinder Admin].

## How to Use the Library 

To familiarize yourself with using this project, you can follow the examples provided in the playground.

The key component is the demo.js file, but in order to effectively utilize it, you'll need to understand the following parameters:
1.  server: https://docs.doofinder.com/api/search/v6/#section/Basics/Endpoint
2.  secret: https://docs.doofinder.com/api/search/v6/#section/Basics/Authentication
3.  hashid: https://docs.doofinder.com/api/search/v6/#section/Basics/Conventions
4.  sessionId: https://docs.doofinder.com/api/search/v6/#section/Basics/Conventions
## Documentation

**IMPORTANT:** This is a work in progress.

<https://doofinder.github.io/js-doofinder/>

[cors]: https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[doofinder admin]: https://admin.doofinder.com/admin
[doofinder]: https://www.doofinder.com

## Browser Support

| Browser                | Standalone | ES Module |
|------------------------|------------|-----------|
| Edge                   | 15+        | 16+       |
| Firefox                | 32+        | 60+       |
| Chrome                 | 55+        | 61+       |
| Safari                 | 11+        | 11+       |
| Opera                  | 42+        | 48+       |
| Chrome for Android     | 76+        | 76+       |
| Firefox for Android    | 68+        | 68+       |
| UC Browser for Android | 12.12+     | 12.12+    |
| Safari for iOS         | 11+        | 11+       |
