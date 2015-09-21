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

    browserify:
      standalone:
        src: ['lib/doofinder.js'] 
        dest: 'dist/doofinder.standalone.js'
      options:
        standalone: 'Doofinder' 

    uglify:
      dist:
        files:
          'dist/doofinder.min.js': ['dist/doofinder.standalone.js']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-uglify'

  grunt.registerTask 'default', ['coffee', 'mochaTest']
  grunt.registerTask 'build_for_client', ['uglify']