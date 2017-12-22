module.exports =
  toDashCase: (name) ->
    name.replace /[A-Z]/g, ((m) -> "-" + m.toLowerCase())
  toCamelCase: (name) ->
    name = name.replace /([-_])([^-_])/g, ((m, p1, p2) -> p2.toUpperCase())
    name.replace /[-_]/g, ""
