module.exports = (config) ->
  conf = 
    customHeaders: [
      match: "context.html"
      name: "Pragma"
      value: "no-cache"
    ,
      match: "context.html"
      name: "Cache-Control"
      value: "no-cache"
    ]

    preprocessors:
        'test_karma/*.coffee': ['coffee']

    coffeePreprocessor:
        options:
          bare: true,
          sourceMap: false
        transformPath: (path) ->
          return path.replace(/\.coffee$/, '.js')

    frameworks: ['mocha', 'chai']
    reporters: ['spec']
    singleRun: true

    files: [
      'test_karma/doofinder.min.js',
      'test_karma/*.coffee'
    ]

    customLaunchers:
      desktop:
        base: "Chrome"
        flags: ["--window-size=1024,768"] # To mimic BrowserStack defaults

    browsers: ["desktop"]

  config.set conf
