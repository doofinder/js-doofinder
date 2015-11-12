module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      compile:
        files:
          'lib/client.js': ['src/client.coffee']
          'lib/controller.js': ['src/controller.coffee']
          'lib/displayer.js': ['src/displayer.coffee']
          'lib/doofinder.js': ['src/doofinder.coffee']
          'lib/helpers.js': ['src/helpers.coffee']
    mochaTest:
      options:
        reporter: 'nyan'
      src: ['test/tests.coffee']

    exec:
      cmd: 'browserify --standalone Doofinder lib/doofinder.js > dist/doofinder.standalone.js'

    uglify:
      dist:
        files:
          'dist/doofinder.min.js': ['dist/doofinder.standalone.js']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-exec'
  grunt.loadNpmTasks 'grunt-contrib-uglify'

  grunt.registerTask 'default', ['coffee', 'mochaTest']
  grunt.registerTask 'build_for_client', ['exec', 'uglify']