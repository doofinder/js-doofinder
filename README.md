js-doofinder
=============

Doofinder NodeJS Client

This module is a NodeJS wrapper for `Doofinder Search API 4`


Installation
------------
`npm install js-doofinder`

Usage
-----
```coffeescript

Doofinder = require "js-doofinder"

dfClient = new Doofinder "5886462410a02639acc5054bc464ec18", # hashid 
					     "eu1-dafdsafadsffsffafdasfsasd" # api key

```
Add query terms
```coffeescript

dfClient.add_query("ipad")
```
Add some filters
```coffeescript
# Some terms
dfClient.add_filter("category", ["pants", "skirts"])

# Adding a term
dfClient.add_filter_term("category", "t-shirts")
# filter terms will be: pants, skirts and t-shirts

# Adding a range_filter
dfClient.add_filter_range("price", 20, 500)
# prices from 20 to 500 monetary units

# Managing response and errors
callback = (err, res) ->
      console.log 'RESPONSE: ' + res
      console.log 'ERROR: ' + err

# Performing the API call
dfClient.search callback

```
