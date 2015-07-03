js-doofinder
=============

Doofinder NodeJS Client

This module is a NodeJS wrapper for `Doofinder Search API 4`


Installation
------------
`npm install doofinder`

Usage
-----
```coffeescript

Doofinder = require "doofinder"

dfClient = new Doofinder "5886462410a02639acc5054bc464ec18", # hashid 
                         "eu1-dafdsafadsffsffafdasfsasd", # api key

```
Add query terms and extra params. You can add every available parameter in [Doofinder Search API] (http://doofinder.com/en/developer/search-api). You can also add some filters
under the `filters` key:
```coffeescript
params = 
  # Set query terms
  query: "ipad"
  # Set the number of results per page
  rpp: 10
  # Set the page number
  page: 2
  # Add some filters
  filters:
    category: ["Fundas iPad", "Accesorios iPad"]
    price:
      from: 20
      to: 500
      
# Perform the API call
dfClient.search params, (err, res) ->
  console.log 'RESPONSE: ' + JSON.stringify(res)
  console.log 'ERROR: ' + err
```

You'll get the response as follows. Note that you'll obtain both results and facets to continue filtering:

```coffeescript
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
    "image":"http://images.k-tuin.com/res/product200/resource_166376.jpg",
    "id":"APXAI003",
    "header":"Apple Dock para iPad","href":"http://www.k-tuin.com/app/catalog.do?action=ShowProductDetail&productId=9531&ref=doofinder",
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

