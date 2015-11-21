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
* A display manager for shaping the data, using [Handlebars](http://handlebarsjs.com) templates.
* A controller that orchestrate client and displayers.
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

- The ```Displayer``` will take a DOM node and a Handlebars template. The goal of this class is shaping the results by the template an insert them in the DOM. There will be two ways to display the data: by appending them or by replacing them.

- The ```Controller``` will receive a ```Client``` and a set of ```Displayer```. ```Controller``` could also receive initial params, that will be in every search the ```Client``` will perform.

Once you have instantiated the controller, you can use its methods which will perform the search call, will paint the results and will trigger some events you can use from your view. 

### Displayer instantiation:

The arguments to instantiate it are:

* Required

  * **container `String`:** a DOM node CSS selector. 
  * **template `String | Function`:** a [Handlebars] (http://handlebars.com) template to shape the way the results will be shown. This template could be a String with the template or a precompiled template.
       

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
var displayer = new doofinder.Displayer(
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
          "ref-id": 233,
          utm_source: "doofinder"
        },
        translations: {
          "Price": "Precio"
        }
      }
);

  ```


### Displayer methods:

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
displayer.on("df:results_received", function(event, res){
   console.log(res.total + "RESULTS FOUND"); 
});
```

### Controller instantiation:

The arguments to instantiate it are:

* Required

  * **client `doofinder.Client`:** the object we use to perform the queries. 
  * **displayers `doofinder.Displayer | Array(doofinder.Displayer)`:**  where and how the results are shown.
       

* Optional
  * **initialParams `Object`:** an `Object` with params fixed for every search you will perform. This can be every param you can use in the `Client.search` method. You can also set fixed filters under the key `filters`.

```javascript
var client = new doofinder.Client (
    "5886462410a02639acc5054bc464ec18", 
    "eu1",
    ["product", "recipes"]
);

var displayer = new doofinder.Displayer (
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
    displayer,
    {
      rpp: 10,
      filters: {
          brand: ["Adidas", "Nike"]
      }
    }
);

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


## Example 1: Quick & Dirty - Querying and showing results

In this example we'll write a view that will just show results.

Let's begin by showing a simple HTML template (myview.html):

``` html
<html lang="en">
<head>
<script type="application/javascript" src="path/to/your/js/jquery.min.js"></script>
<script type="application/javascript" src="path/to/your/js/jquery.typewatch.js"></script>
<script type="application/javascript" src="path/to/your/js/doofinder.min.js"></script>
<script type="application/javascript" src="path/to/your/js/myview.js"></script>
</head>
<input type="text" id="query" />
<body>
<div id="container">
  </div>
</div>
</body>
```
Note that we are importing two javascript files:
- jquery.min.js and jquery.typewatch.js: necessary to manage the search box behavior.
- doofinder-min.js: contains doofinder namespace with its classes.
- myview.js: contains specific info about my view and thats the place where we'll instantiate Controller.

Let's add some functionality to our html view:

``` javascript
(function(doofinder, $, document){
  
  var hashid = 'a3fd9dcvga0932el99ds4az';
  var zone = 'eu1';
  var container = '#container', // required
  var template = '{{#each results}}' + // required
            '<h1>{{header}}</h1>' +
            '{{/each}}'
  };

  $(document).ready(function(){ 
        // Instantiation
        var client = new doofinder.Client(hashid, zone);
        var displayer = new doofinder.Displayer(container, template);
        var controller = new doofinder.Controller(Client, Displayer);

        $('#query').typeWatch({
          callback: function () {
            var query = $(this).val();
            controller.search(query);
          },
          wait: 43,
          captureLength: 3
        });
  });

})(doofinder, jQuery, document);
```
The options we have filled in:

- hashid: the unique hashid for your search engine.
- zone: the zone where is your search engine (eu1, us1)
- container: the CSS selector of our hits container.
- searchBox: the CSS selector of our query input.
- template: the Handlebars template that will shape your results.

At the moment, we have a search box where we can write a query and results we'll be shown since the fourth character we type.

## Example 2: A simple paging

In the first example, we wrote a simple view that reacted when a user typed some characters. Although it was cool,
we only could see a few results (10 per query), what is not so cool.

In this example, we'll implement a simple mechanism to show all the results by pushing a button.

This is the html we'll show:

``` html
<html lang="en">
<head>
<script type="application/javascript" src="path/to/your/js/jquery.min.js"></script>
<script type="application/javascript" src="path/to/your/js/jquery.typewatch.js"></script>
<script type="application/javascript" src="path/to/your/js/doofinder.min.js"></script>
<script type="application/javascript" src="path/to/your/js/myview.js"></script>
</head>
<input type="text" id="query" />
<body>
<div id="container">
</div>
<a id="nextbutton">Next</a>
</body>
```

The only thing we added to last example is a link. When this link is clicked, we'll call nextPage controller's method. 
The javascript will be:

``` javascript
(fuction(doofinder, $, document){
  
  var hashid = 'a3fd9dcvga0932el99ds4az';
  var zone = 'eu1';
    
  var container = '#container';
  var template = '{{#each results}}' + 
        '<h1>{{header}}</h1>' +
        '{{/each}}';
    
  $(document).ready(function(){
    // Instantiation
    var client = new doofinder.Client(hashid, zone);
    var displayer = new doofinder.Displayer(container, template);
    var controller = new doofinder.Controller(client, displayer);
    
    $('#query').typeWatch({
          callback: function () {
            var query = $(this).val();
            controller.search(query);
          },
          wait: 43,
          captureLength: 3
        });

    $('#nextbutton').on("click", function(){
        controller.nextPage();
    });
  });

})(doofinder, jQuery, document);
```

This is example adds a block where some behavior is specified. When nextButton
is clicked we'll call to nextPage controller's function, which will perform the
search API call and.

But there's something wrong. What if a user push next page when no query is done?
We'll show the second page for an empty query, what makes no much sense. We'll only
show the nextButton when a query will be written. So we can hide the button via css:

```css

#nextbutton{
    display: none;
}
```

Once you have linked the stylesheet in your html, add some javascript to show the button. 
In our "custom-behavior block":

```javascript

   $(document).ready(function(){
    // Instantiation
    var client = new doofinder.Client(hashid, zone);
    var displayer = new doofinder.Displayer(container, template);
    var controller = new doofinder.Controller(client, displayer);
    var nextButton = $("#nextbutton");
    
    $('#query').typeWatch({
          callback: function () {
            var query = $(this).val();
            controller.search(query);
          },
          wait: 43,
          captureLength: 3
      });

   nextButton.on("click", function(){
        controller.nextPage();
      });

   displayer.bind("df:search", function(){
      nextButton.show();
    });
    
  });
```
`df:search` event is triggered by the displayer when someone makes a query. 
So this way, we can avoid the unexpected situation described before.


## Example 3: Scroll paging

In the next example we'll add an infinite scroll paging. We'll add the jquery.dfscroll
plugin, and we call nextPage in its callback. nextPage will be called when scroll is about to
reach the bottom.

```html
<html lang="en">
<head>
  <link rel="stylesheet" href="myview.css"/>
  <script type="application/javascript" src="path/to/your/js/jquery.min.js"></script>
  <script type="application/javascript" src="path/to/your/js/jquery.typewatch.js"></script>
  <script type="application/javascript" src="path/to/your/js/jquery.dfscroll.js"></script>
  <script type="application/javascript" src="doofinder.min.js"></script>
  <script type="application/javascript" src="myview.js"></script>
</head>
  
<body>
  <input type="text" id="query" />
  <div class="wrapper">
    <div class="container">
    </div>
  </div>
</body>
``
And we are going to create the inner scroll via css. 

```css
#wrapper{
    position: relative;
    height: 800px;
    overflow: auto;
}
```

If we visit our page and perform a query, some of the content will be hidden. If
you move your mouse to the content, you'll be able to move down and up.

Let's add some javascript to trigger next_page event when scroll is down. 

```javascript
(function(doofinder, $, document){
 
  var hashid = "6a96504dc173514cab1e0198af92e6e9";
  var zone = "eu1";
 
  var container = "#container"; //required
        
  var template = '{{#results}}' + // required
        '<h1>{{header}}</h1>' +
        '{{/results}}';
    
  
  
  $(document).ready(function(){
    // Instantiation
    var client = new doofinder.Client(hashid, zone);
    var displayer = new doofinder.Displayer(container, template);
    var controller = new doofinder.Controller(client, displayer);
    
    // get the DOM components we'll use
    var wrapper = $("#wrapper");
    // set scroll behavior
    // this requires that container overflow
    // is auto
    

      throttle('scroll', 'df:scroll', container);
      // handling scroll event
      container.on('dfScroll', function () {
          // New results requested when last item is
          // near and scroll hasn't visited it.
          if (container.height() >= (searchEngine.resultsContainer.height() + searchEngine.resultsContainer.position().top))
          {
             // triggers next_page event
             searchEngine.resultsContainer.trigger('df:next_page');
          }
      });

    // Go to the top when new query    
    dfCtrl.searchBox.on('df:new_query', function () {
        container.animate({scrollTop: 0}, "quick");
    });
  });
  
})(doofinder, jQuery, document);

```

