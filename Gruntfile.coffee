module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      release:
        files:
          'lib/client.js': ['src/client.coffee']
          'lib/controller.js': ['src/controller.coffee']
          'lib/displayer.js': ['src/displayer.coffee']
          'lib/doofinder.js': ['src/doofinder.coffee']
          'lib/helpers.js': ['src/helpers.coffee']

    browserify:
      release:
        src: ['lib/doofinder.js']
        dest: 'dist/doofinder.bundle.js'
        options:
          browserfyOptions:
            standalone: 'doofinder'

    exec:
      release:
        'browserify lib/doofinder.js --standalone doofinder > dist/doofinder.bundle.js'      

    mochaTest:
      release:
        options:
          reporter: 'nyan'
        src: ['test/tests.coffee']

    uglify:
      release:
        files:
          'dist/doofinder.min.js': ['dist/doofinder.bundle.js']

    version:     
      release:
        options:
          prefix: '\\s+version:\\s\"'
        src: ['./src/doofinder.coffee']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-exec'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks('grunt-version');

  grunt.registerTask 'default', ['coffee', 'mochaTest']
  grunt.registerTask 'release', ['version:release', 'coffee:release', 'mochaTest:release', 'exec:release', 'uglify:release']