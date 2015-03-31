nodeDoofinder
=============

Doofinder NodeJS Client

This module is a NodeJS wrapper for `Doofinder Search API 4`


Installation
------------
TODO

Usage
-----

```coffeescript

DfClient = require "./dfclient"

client = new DfClient "5886462410a02639acc5054bc464ec18", # hashid 
					  "eu1-dafdsafadsffsffafdasfsasd" # api key

# Adding some extra arguments to querystring
extra_args =
	"foo": "bar"

# Adding some extra headers to request
extra_headers =
	"head1": "stuff"

# Managing response and errors
callback = (err, res) ->
      console.log 'RESPONSE: ' + res
      console.log 'ERROR: ' + err

# Performing the API call
client.search "iphone", extra_headers, extra_args, callback

```