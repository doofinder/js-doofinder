module.exports = (grunt) ->
  grunt.initConfig

    service:
      http:
        shellCommand: 'http-server -p 8008 .'
        generatePID: true
        pidFile: '/tmp/httpserver-js-doofinder.pid'
        options:
          stdio: 'inherit'

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

    browserify:
      default:
        src: ['lib/doofinder.js']
        dest: 'dist/doofinder.js'
        options:
          browserifyOptions:
            standalone: 'doofinder'

    mochaTest:
      options:
        reporter: 'nyan'
        require: [
          'jsdom-global/register'
        ]
      release:
        src: [
          'test/test_*.coffee'
        ]

    uglify:
      release:
        files:
          'dist/doofinder.min.js': ['dist/doofinder.js']

    copy:
      build_scss:
        files: [
          expand: true, cwd: 'node_modules/nouislider/src', src: ['*.css'], dest: 'build_scss/', rename: (dest, src) ->
            console.log dest + src
            return dest + '_' + src.replace(/\.css$/, '.scss')
        ]
      karma:
        files:
          'test_karma/doofinder.css': 'dist/doofinder.css'
          'test_karma/doofinder.js': 'dist/doofinder.js'

    clean:
      build_scss: ['build_scss/']
      karma: ['test_karma/doofinder.*']

    sass:
      options:
        includePaths: ['build_scss']
        sourceComments: false,
        sourceMap: false,
        outputStyle: 'expanded'
      build_scss:
        files: [
          'dist/doofinder.css': 'src/doofinder.scss'
        ]

    karma:
      test:
        configFile: 'karma.conf'

    version:
      library:
        options:
          prefix: '\\s+version:\\s\"'
        src: ['./src/doofinder.coffee']
      bower:
        options:
          prefix: '\"version\":\\s\"'
        src: ['./bower.json']

    watch:
      default:
        files: ['./src/**/*.coffee']
        tasks: ['compile']
      test:
        files: ['./src/**/*.coffee']
        tasks: ['compile', 'test']
      css:
        files: ['./src/**/*.scss']
        tasks: ['css']

  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-karma'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-sass'
  grunt.loadNpmTasks 'grunt-service'
  grunt.loadNpmTasks 'grunt-version'

  grunt.registerTask 'compile', ['coffee:release', 'browserify', 'uglify:release']
  grunt.registerTask 'css', ['copy:build_scss', 'sass:build_scss', 'clean:build_scss']

  grunt.registerTask 'test:mocha', ['mochaTest:release']
  grunt.registerTask 'test:karma', ['copy:karma', 'karma:test', 'clean:karma']
  grunt.registerTask 'test', ['test:mocha', 'test:karma']

  grunt.registerTask 'default', ['dev']
  grunt.registerTask 'dev', ['service:http', 'compile', 'watch:default']
  grunt.registerTask 'dev:test', ['service:http', 'compile', 'test', 'watch:test']

  grunt.registerTask 'release', ['version:library', 'version:bower', 'compile', 'test']
