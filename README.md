# JS-Doofinder

Doofinder Javascript Library
This module is a javascript wrapper for `Doofinder Search API v5`. 


## Installation
### npm
`npm install doofinder`

### bower
`bower install doofinder`

### Downloadable minified javascript file
https://raw.githubusercontent.com/doofinder/js-doofinder/master/dist/doofinder.min.js

## What is out of the box
* A simple client for retrieving data.
* Some widgets for shaping the data, using [Handlebars](http://handlebarsjs.com) templates and managing events.
* A controller that orchestrate client and widgets.
* A set of events that will be triggered when searches are done or when data is ready and you would use wherever you want.



## Simple usage. Just the client:

* If you are developing a server side application with [nodeJS](https://nodejs.org) or you are using [browserify](http://browserify.org/), [webpack](https://webpack.github.io/) or something like that, you can import it via require.
```javascript
var doofinder = require("doofinder");
```
* If you want use it as a static asset at the client side. You can download doofinder.min.js file and link it
wherever you are going to use the library.
```html
<script src="path/to/your/javascript/doofinder.min.js"></script>
```

### Client instantiation:

The arguments to instantiate it are:

  * Required
    * **hashid `String`:** this is your searchengine unique identifier.
    * **API Key `String`:** the zone where the SearchEngine you are requesting is (eu1 for EU, us1 for US) and your API Key, separated by "-".


  * Optional
    * **datatypes `Array`:** if you want restrict the searches to a set of datatypes of the SearchEngine. If you don't set this option, all datatypes will be taken.

```javascript
var client = new doofinder.Client (
    "5886462410a02639acc5054bc464ec18", 
    "eu1-3ciof3dknveji385fnk33f010ffe0a",
    ["product", "recipes"]
    );
                             
```

:bangbang:  **Don't use your API Key when you are programming at the client side. Just use the zone. Look at the next example.**

```javascript
var client = new doofinder.Client (
    "5886462410a02639acc5054bc464ec18", 
    "eu1",
    ["product", "recipes"]
    );
                             
```


### Client Methods:

#### **search**
This method performs a Search API call and retrieves the data. The data will be received by a callback function.

**__Arguments:__**

* **Required:**
  * **query `String`:** the terms you are searching for.
  * **callback `Function`:** the function which receives the API Search response.

* **Optional:**
    * **params `Object`:** an Object that brings all the rest of extra params for the search. Some of the keys you can use are:
      * page: number of the page you are asking for.
      * rpp: results per page.
      * filters: an embedded object with the terms and ranges you are filtering.

      You can also add all the options available in [Doofinder Search API] (http://doofinder.com/en/developer/search-api).

- **Example:**

    For the next search call.

```javascript
client.search("ipad", function(err, res){
  console.log('RESPONSE: ' + JSON.stringify(res));
  console.log('ERROR: ' + err);
  });
```

You'll get the first page with the first 10 results.

```javascript
RESPONSE: {
  "query_counter":1,
  "results_per_page":10,
  "page":1,
  "total":116,
  "query":"ipad",
  "hashid":"6a96504dc173514cab1e0198af92e6e9",
  "max_score":0.75163203,
  "results":[
    {"body":"Cómodo dock para el <em>iPad</em> con el que además de poder cargarlo y sincronizarlo con tu ordenador podrás",
    "dfid":"6a96504dc173514cab1e0198af92e6e9@product@823ca8137de2ee1e08aabbd0bf7dabf7",
    "image":"http://images.mystore.com/res/product200/resource_166376.jpg",
    "id":"APXAI003",
    "header":"Apple Dock para iPad","href":"http://www.mystore.com/app/catalog.do?action=ShowProductDetail&productId=9531&ref=doofinder",
    "type":"product",
    "price":"29.00"}, ...
    
  "facets":{
    "categories":{
      "_type":"terms",
      "missing":0,
      "total":235,
      "other":0,
      "terms":[{"term":"Fundas iPad","count":85},
               {"term":"Accesorios iPad","count":31},
               {"term":"Entretenimiento iPhone","count":25},
               {"term":"Comprar un iPad","count":25},
               {"term":"Altavoces","count":19},
               {"term":"Auriculares","count":10},
               {"term":"Accesorios iPhone","count":10},
               {"term":"Outlet","count":6},
               {"term":"Accesorios Mac","count":5},
               ...
```

Add some extra params. 

```javascript
params = {
  # Set the number of results per page
  rpp: 20,
  # Set the page number
  page: 2,
  # Add some filters
  filters:{
    category: ["Fundas iPad", "Accesorios iPad"],
    price:{
      from: 20,
      to: 500
    }
  }
}
```

Perform the API call.

```javascript    
client.search("ipad", params, function(err, res){
  console.log('RESPONSE: ' + JSON.stringify(res));
  console.log('ERROR: ' + err);
}
  
```

You'll get the response as follows. Note that you'll obtain both results and facets to continue filtering:

```javascript
RESPONSE: {
  "query_counter":3,
  "results_per_page":20,
  "page":2,
  "total":116,
  "query":"ipad",
  "hashid":"6a96504dc173514cab1e0198af92e6e9",
  "max_score":0.75163203,
  "results":[
    {"body":"KTICFP12 Funda acolchada para proteger tu iPad con la portada del periódico. La funda imita perfectamente a un auténtico periódico.",
    "dfid":"6a96504dc173514cab1e0198af92e6e9@product@823ca8137de2ee1e08aabbd0bf7dabf7",
    "image":"http://images.xxx.com/res/product20/resource_156576.jpg",
    "id":"APXAI003",
    "header":"Funda iPad","href":"http://www.xxx.com/app/catalog.do?action=ShowProductDetail&productId=9531&ref=doofinder",
    "type":"product",
    "price":"29.00"}, ...
    
  "facets":{
    "categories":{
      "_type":"terms",
      "missing":0,
      "total":235,
      "other":0,
      "terms":[{"term":"Fundas iPad","count":85},
               {"term":"Accesorios iPad","count":31},
               {"term":"Entretenimiento iPhone","count":25},
               {"term":"Comprar un iPad","count":25},
               {"term":"Altavoces","count":19},
               {"term":"Auriculares","count":10},
               {"term":"Accesorios iPhone","count":10},
               {"term":"Outlet","count":6},
               {"term":"Accesorios Mac","count":5},
               ...
```


## Complete Library Usage:

You can also use the Displayer and Controller classes in order to manage the way you show the results. To use the whole thing we'll instantiate a ```Client```, one or more than one Displayer, and then we'll pass them to the ```Controller```.

- The ```Widget``` will take a DOM node and a Handlebars template. The goal of this class is shaping the results by the template an insert them in the DOM. We'll offer some standard
widgets: QueryInputWidget, InfiniteScrollWidget. The developer using the library could write theirs own widgets, by accomplishing the contract, implementing some functions that are
required for the right behavior.

- The ```Controller``` will receive a ```Client``` and a set of ```Widget```. ```Controller``` could also receive initial params, that will be in every search the ```Client``` will perform.

Once you have instantiated the controller, you can use its methods which will perform the search call, will paint the results and will trigger some events you can use from your view. 

### QueryInputWidget instantiation:
QueryInputWidget abstracts a queryInput where the user will write the search terms. You will pass the selector in the instantiation and the widget will perform the searches to the client.

The arguments to instantiate it are:

* Required

  * **queryInput `String`:** this is a CSS selector for the queryInput. 
       

```javascript
var queryInputWidget = new doofinder.QueryInputWidget('#query');
```

### InfiniteScrollWidget instantiation:
InfiniteScrollWidget represents to a results container with infinite scroll paging. You will pass the scroll selector, results container selector and a [Handlebars](http://handlebars.com) template.

The arguments to instantiate an InfiniteScrollWidget are:

* Required

  * **wrapper `String`:** this is the scroll element selector. 
  * **container `String`:** this is the results container selector.
  * **template `String`:** this is a Handlebars template we'll paint the results with.

* Optional
  * **options `Object`:**
          
    * **urlParams `Object`:** this is an object whose elements will be added as a querystring. This option will be used in a special [Handlebars] (http://handlebars.com) template tag. So if you have `urlParams: {foo: "bar"}` in your settings and `{{#url-params}}{{url}}{{/url-params}}` in your template th url will be shown as `http://your_url?foo=bar`

    * **currency `Object`:** this is an object you can use to model how the prices will be shown. You will be able to use the `{{#formatCurrency}}{{price}}{{/df_formatCurrency}}`. The keys you have to fill in are:
      * **symbol:** this is the symbol you want to use for your currency, it can be either an utf-8 symbol, like '€' or the html escaped sequence, like '&euro;'
      * **decimal:** The symbol used to separate the decimal part of the price. Usually ',' or '.'.
      * **thousand:** The symbol used to separate thousands in the price. Usually '.' or ','.
      * **precision:** How many decimals you want your price to have
      * **format:** Where to put the currency symbol in relation with the price value. It is a format string: ("%s %v") where %s is changed by the currency symbol and %v is changed by the price value. Say you have a price of 13 euros. Then if format is: "%s%v" the price would be shown as €13.

    * **translations `Object`:** an object with some strings you would like to replace by others. This is interesting for those ResultsDisplayers that share template. A string must be in a `{{translate}}` tag.  So if you have `translations: {"foo": "bar"}` in your settings and `{{translate}}foo{{/translate}}` in your template, this will be shown as `bar`.
          
    * **helpers `Object`:** you can add custom Handlebars helpers. You can get more information about Handlebars expressions [here] (http://handlebarsjs.com/expressions.html).

  ```javascript
var resultsWidget = new doofinder.InfiniteScrollWidget(
      "#wrapper",
      "#container",
      "{{#each results}}<h1>title</h1>{{/each}}",
      {
        currency: {
          symbol: '&euro;',
          decimal: ',',
          thousand: '.',
          format: '%v %s (VAT included)'
        },
        urlParams: {
          "ref-id": 233,
          utm_source: "doofinder"
        },
        translations: {
          "Price": "Precio"
        }
      }
);

  ```


### Widget methods:
These methods apply to every widget in the library. If you implement your own widgets you have to implement this methods and other we'll talk about the next section.

#### **bind**
This method will assign a callback to an event that will be triggered for the `container`. Note that to call this method it's necessary to be in the context of Controller.

**__Arguments:__**

* **Required:**
  * **event `String`:** a String with the event name. Described in the table above.
  * **callback `Function`:** the function which handles the event. It receives some params described in the table above.

Event Name | Callback Arguments | Description
---------- | ------------------ | -----------
df:search   | <ul><li>event(Object): information about the event.</li><li>params(Object): the object will be send as params to the Search API.</li></ul> | This event is triggered when controller.search is called.
df:next_page  | <ul><li>event(Object): information about the event.</li><li>params(Object): the object will be send as params to the Search API.</li></ul> | This event is triggered when controller.nextPage is called.
df:get_page   | <ul><li>event(Object): information about the event.</li><li>params(Object): the object will be send as params to the Search API.</li></ul> | This event is triggered when controller.getPage is called.
df:results_received | <ul><li>event(Object): information about the event.</li><li>res(Object): the Search API response</li></ul> | This event is triggered when new results are received from Search API.

* **Example:**

```javascript
widget.bind("df:results_received", function(event, res){
   console.log(res.total + "RESULTS FOUND"); 
});
```

### Controller instantiation:

The arguments to instantiate it are:

* Required

  * **client `doofinder.Client`:** the object we use to perform the queries. 
  * **widgets `doofinder.Widget | Array(doofinder.Widget)`:**  where and how the results are shown.
       

* Optional
  * **initialParams `Object`:** an `Object` with params fixed for every search you will perform. This can be every param you can use in the `Client.search` method. You can also set fixed filters under the key `filters`.

```javascript
var client = new doofinder.Client (
    "5886462410a02639acc5054bc464ec18", 
    "eu1",
    ["product", "recipes"]
);

var queryInputWidget = new doofinder.QueryInputWidget("#query");
var resultsWidget = new doofinder.InfiniteScrollWidget (
      "#myDivId",
      "{{#each results}}<h1>title</h1>{{/each}}",
      {
        currency: {
          symbol: '&euro;',
          decimal: ',',
          thousand: '.',
          format: '%v %s (VAT included)'
        },
        urlParams: {
          ref: 233
        },
        translations: {
          "Price": "Precio"
        }
      }
);

var controller = new doofinder.Controller (
    client,
    [queryInputWidget, resultsWidget],
    {
      rpp: 10,
      filters: {
          brand: ["Adidas", "Nike"]
      }
    }
);

controller.start();

```

### Controller methods:

#### **search:**
This method will perform a search API Call and will show the results in your containers.

**__Arguments:__**

* **Required:**
  * **query `String`:** a String with the event name. Described in the table above.

* **Optional:** 
  * **params `Object`:** params will be passed to the client.

#### **nextPage:**
This method will show the next page for the current search state.

**__Arguments:__**

* **Optional:** 
  * **replace `Boolean`:** Set it `true` if you want the newer content replace the older in your containers. This is `false` by default, so the next page will be appended if you do nothing.

#### **getPage:**
This method will show a page for the current search state. This page will replace the current content in your containers.

**__Arguments:__**

* **Required:**
  * **page `Number`:** the number of the page you want to show.


## Example 1: A simple results view

In this example we'll write a view that will just show results.

Let's begin by showing a simple HTML template (myview.html):

``` html
<html lang="en">
<head>
<script type="application/javascript" src="path/to/your/js/doofinder.min.js"></script>
<script type="application/javascript" src="path/to/your/js/myview.js"></script>
</head>
<body>
  <input type="text" id="query"/>
  <div id="scroll">
    <div id="container"></div>
    </div>
  </div>
</body>
```
Note that we are importing two javascript files:
- doofinder-min.js: contains doofinder namespace with its classes.
- myview.js: contains specific info about my view and thats the place where we'll instantiate Controller.

We need to create the inner scroll via css.

```css
#scroll{
    position: relative;
    height: 800px;
    overflow: auto;
}
```

Let's add some functionality to our html view:

``` javascript
(function(doofinder, document){
  
  var hashid = 'a3fd9dcvga0932el99ds4az';
  var zone = 'eu1';
  var queryInput = '#query';
  var scrollWrapper = '#scroll';
  var container = '#container'; // required
  var template = '{{#each results}}' + // required
            '<h1>{{header}}</h1>' +
            '{{/each}}';
  };

  $(document).ready(function(){ 
        // Instantiation
        var client = new doofinder.Client(hashid, zone);
        var queryInputWidget = new doofinder.QueryInputWidget(queryInput);
        var resultsWidget = new doofinder.InfiniteScrollWidget(scrollWrapper, container, template);
        var controller = new doofinder.Controller(Client, [queryInputWidget, resultsWidget]);
        controller.start();

  });

})(doofinder, document);
```


The options we have filled in:

- hashid: the unique hashid for your search engine.
- zone: the zone where is your search engine (eu1, us1)
- queryInput: the CSS selector of our query input.
- scrollWrapper: the CSS selector for the scroll.
- container: the CSS selector of our hits container.
- template: the Handlebars template that will shape your results.

At the moment, we have a search box where we can write a query and results we'll be shown since the fourth character we type.

## Creating your own widgets

To implement a widget that you can add to a controller you must implement the next methods. Note that with your own widgets you must implement
your own events managing.

#### **start:**
In this method you will bind the calls to controllers methods. In start you can access to controller methods.

#### **render:**
This method will receive the search API response and you'll be able to use it for rendering or show. This function will be called by search and getPage controller's methods.

**__Arguments:__**

* **Required:**
  * **res `Object`:** with the Search API response. An Example of this response:
  ```javascript

  {
    "query_counter": 7, 
    "results_per_page": 20, 
    "page": 4, 
    "total": 335, 
    "query": "skin", 
    "hashid": "6a96504dc173514cab1e0198af92e6e9", 
    "max_score": 3.2752259,
    "results": [{
        "type": "product",
        "dfid": "6a96504dc173514cab1e0198af92e6e9@product@b458b8febcef7e8b854ebdd7eda80b96",
        "dfscore": 1.9850867,
        "description": "v/a: skins & punks vol. 1 cd",
        "title": "V/A: Skins & Punks Vol. 1 CD",
        "mpn": "10433",
        "brand": "STEP 1 MUSIC",
        "best_price": 14.16,
        "availability": "in stock",
        "image_link": "http://dhb3yazwboecu.cloudfront.net/167/10433m.jpg",
        "link": "http://www.skinsandpunks.com/step-1-music/va-skins-punks-vol-1-cd",
        "condition": "new",
        "g:product_maintype": "STEP 1 MUSIC",
        "g:product_subtypes": null,
        "price": "14.16",
        "id": "18371",
        "categories": ["STEP 1 MUSIC"],
        "highlight": {"description": ["v/a: <em>skins</em> & punks vol. 1 cd"]}
    }],
    "facets": {
      "categories": {
            "_type": "terms", 
            "terms": [
              {"term": "CHAPAS MANOLO", "count": 79}, {
                "term": "MUSICA",
                "count": 42
            }, {"term": "VINILO", "count": 41}, {
                "term": "PUNK / OI!",
                "count": 39
            }, {"term": "LP/10", "count": 26}, {
                "term": "ACCESORIOS",
                "count": 26
            }, {"term": "ROPA", "count": 16}, {
                "term": "STEP 1 MUSIC",
                "count": 15
            }
          ]
        },
      "best_price": {
            "_type": "range", 
                "ranges": [{
                "from": 0,
                "count": 333,
                "min": 0,
                "max": 69.9000015258789,
                "total_count": 333,
                "total": 3588.360008239746,
                "mean": 10.775855880599838
            }]
        }
    }
  }

  ```

#### **renderNext:**
This method will receive the search API response and you'll be able to use it for rendering or show. It will be called by nextPage controller's method.

**__Arguments:__**

* **Required:**
  * **res `Object`:** with the Search API response.

## Example 2: A simple widget

You can implement your own widget by implementing the methods described. For this example we have used jQuery and jquery.dfscroll library to implement
the infinite scroll.

```javascript

(function($){

    /*
    constructor
    
    just assign wrapper property for scrolling and 
    calls super constructor.
    
    @param {String} wrapper
    @param {String} container
    @param {Function} template: a rendered handlebars template
    @api public
     */

    function InfiniteScrollWidget(wrapper, container, template) {
      this.wrapper = wrapper;
      this.container = container;
      this.template = template;

    }

    InfiniteScrollWidget.prototype.start = function() {
      var _this;
      _this = this;
      $(this.wrapper).dfScroll({
        callback: function() {
          return _this.controller.nextPage();
        }
      });
    };


    /*
    render
    
    Replaces the older results in container with
    the given
    
    @param {Object} res
    @api public
     */

    InfiniteScrollWidget.prototype.render = function(res) {
      var html;
      html = this.template(res);
      $(this.container).html = html;
      
    };


    /*
    renderNext
    
    Appends results to the older in container
    @param {Object} res
    @api public
     */

    InfiniteScrollWidget.prototype.renderNext = function(res) {
      var html;
      html = this.template(res);
      $(this.container).append(html);
    };

    return InfiniteScrollWidget;

  })(jQuery);
```







