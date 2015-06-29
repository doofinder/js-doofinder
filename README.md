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
                         10 # results per page

```
Add query terms and extra params.
```coffeescript
params = 
  # Set query terms
  query: "ipad"
  # Set the result transformer
  transform: "dflayer"
  # Add some filters
  filters:
    category: ["pants", "skirts"]
    price:
      from: 20
      to: 500
      
# Callback to manage response and errors
callback = (err, res) ->
      console.log 'RESPONSE: ' + JSON.stringify(res)
      console.log 'ERROR: ' + err

# Perform the API call
dfClient.search params, callback
```

You'll the response as follows:

```coffeescript
RESPONSE: {"query_counter":1,"results_per_page":10,"page":1,"total":0,"query":"ipad","hashid":"6a96504dc173514cab1e0198af92e6e9","max_score":null,"results":[],"filter":{"terms":{"category":["pants","skirts"]}},"query_name":"phonetic_text"}
```

