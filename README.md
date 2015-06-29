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
                         "eu1-dafdsafadsffsffafdasfsasd" # api key
                         10 # results per page

```
Add query terms and extra params.
```coffeescript

dfClient.set_query("ipad")
```

```coffeescript
params = 
  query: "ipad"
  transform: "dflayer"
  filters:
    category: ["pants", "skirts"]
    price:
      from: 20
      to: 500
      

# Managing response and errors
callback = (err, res) ->
      console.log 'RESPONSE: ' + res
      console.log 'ERROR: ' + err

# Performing the API call
dfClient.search params, callback

```
