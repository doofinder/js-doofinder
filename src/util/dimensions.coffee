
calculateDimension = (name, elem) ->
  if elem.nodeType == 9
    doc = elem.documentElement
    Math.max(elem.body[ "scroll#{name}" ], doc[ "scroll#{name}" ],
              elem.body[ "offset#{name}" ], doc[ "offset#{name}" ],
              doc[ "client#{name}" ])
  else
    elem["client#{name}"]

clientWidth = (elem) ->
  calculateDimension("Width", elem)

clientHeight = (elem) ->
  calculateDimension("Height", elem)

module.exports =
  clientWidth: clientWidth
  clientHeight: clientHeight