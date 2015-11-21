module.exports =
	extend: ->
	  i = 1
	  while i < arguments.length
	    for key of arguments[i]
	      if arguments[i].hasOwnProperty(key)
	        arguments[0][key] = arguments[i][key]
	    i++
	  arguments[0]