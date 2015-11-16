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

## What is out the box
* A simple client for retrieving data.
* A display manager for shaping the data, by using [Handlebars] (http://handlebarsjs.com) templates.
* A controller that orchestrate client and displayer to make it work.
* A set of events that will be triggered when data is ready and you would use wherever you want.



## Simple usage. Just the client:

* If you are developing a server side application with [nodeJS] (https://nodejs.org) or you are using [browserify] (http://browserify.org/), [webpack](https://webpack.github.io/) or something like that, you can import it via require.
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
    * **append `Boolean`:** 
          
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

#### **on**
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

