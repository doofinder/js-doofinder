module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      release:
        files: [
            expand: true
            cwd: 'src/'
            src: [
              '*.coffee',
              '**/*.coffee'
            ]
            dest: 'lib/'
            ext: '.js'
          ]
        
    exec:
      release:
        'browserify lib/doofinder.js --standalone doofinder > dist/doofinder.js'      

    browserify:
      default:
        src: ['lib/doofinder.js']
        dest: 'dist/doofinder.js'
        options:
          browserifyOptions:
            standalone: 'doofinder'

    mochaTest:
      release:
        options:
          reporter: 'nyan'
        src: ['test/tests.coffee']

    uglify:
      release:
        files:
          'dist/doofinder.min.js': ['dist/doofinder.js']

    version:     
      library:
        options:
          prefix: '\\s+version:\\s\"'
        src: ['./src/doofinder.coffee']
      bower:
        options:
          prefix: '\"version\":\\s\"'
        src: ['./bower.json']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-exec'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks('grunt-version');

  grunt.registerTask 'default', ['coffee', 'mochaTest']
  grunt.registerTask 'release', ['version:library', 'version:bower', 'coffee:release', 'browserify', 'uglify:release']
