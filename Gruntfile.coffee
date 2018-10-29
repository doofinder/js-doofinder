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
          expand: true
          cwd: 'node_modules/nouislider/distribute'
          src: ['*.css', '!*.min.css']
          dest: 'build_scss/'
          rename: (dest, src) ->
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
      project:
        options:
          prefix: '\"doofinder\",\\s+\"version\":\\s+\"'
        src: ["package.json", "package-lock.json"]

    watch:
      default:
        files: ['./src/**/*.coffee']
        tasks: ['compile']
      test:
        files: [
          "./src/**/*.coffee",
          "./test/**/*.coffee",
          "./test_karma/**/*.coffee"
        ]
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

  # `compile` generates final JS code ready to be used
  grunt.registerTask 'compile', ['coffee:release', 'browserify', 'uglify:release']
  # `css` builds sample CSS required by some elements like noUiSlider
  grunt.registerTask 'css', ['copy:build_scss', 'sass:build_scss', 'clean:build_scss']

  # `test:mocha` runs Mocha tests in NodeJS
  grunt.registerTask 'test:mocha', ['mochaTest:release']
  # `test:karma` runs browser tests in Karma
  grunt.registerTask 'test:karma', ['copy:karma', 'karma:test', 'clean:karma']
  # `test` runs all tests
  grunt.registerTask 'test', ['test:mocha', 'test:karma']

  # `dev` runs the development environment, with a server at localhost:8008
  grunt.registerTask 'dev', ['service:http', 'compile', 'watch:default']
  # `dev:test` runs the development environment and tests are run after compile
  grunt.registerTask 'dev:test', ['service:http', 'compile', 'test', 'watch:test']
  # well, the default
  grunt.registerTask 'default', ['dev']

  # if you need only the server, here you are
  grunt.registerTask "serve", ["service:http"]

  #
  # Release Tasks
  #
  # Be careful, these tasks change version numbers on each execution!!!

  grunt.registerTask "release", [
    "version:project:patch",
    "version:library",
    "version:bower",
    "compile",
    "test"
  ]

  grunt.registerTask "release:minor", [
    "version:project:minor",
    "version:library",
    "version:bower",
    "compile",
    "test"
  ]

  grunt.registerTask "release:major", [
    "version:project:major",
    "version:library",
    "version:bower",
    "compile",
    "test"
  ]
