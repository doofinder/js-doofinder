module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      compile:
        files:
          'lib/doofinder.js': ['src/*.coffee']
    mochaTest:
      options:
        reporter: 'nyan'
      src: ['test/tests.coffee']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'

  grunt.registerTask 'default', ['coffee', 'mochaTest']