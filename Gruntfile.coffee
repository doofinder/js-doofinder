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
          'test/test_client.coffee',
          'test/test_controller.coffee',
          'test/test_session.coffee',
          'test/test_stats.coffee',
          'test/test_util_freezer.coffee',
          'test/test_util_thing.coffee',
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
          'test_karma/doofinder.js': 'dist/doofinder.js'

    clean:
      build_scss: ['build_scss/']
      karma: ['test_karma/doofinder.js']

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
      coffee:
        files: ['./src/**/*.coffee']
        tasks: ['compile', 'testMocha']
      css:
        files: ['./src/**/*.scss']
        tasks: ['css']
      karma:
        files: ['./test_karma/**/test_*.coffee']
        tasks: ['testKarma']

  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-karma'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-sass'
  grunt.loadNpmTasks 'grunt-version'

  grunt.registerTask 'compile', ['coffee:release', 'browserify', 'uglify:release']
  grunt.registerTask 'css', ['copy:build_scss', 'sass:build_scss', 'clean:build_scss']

  grunt.registerTask 'testMocha', ['mochaTest:release']
  grunt.registerTask 'testKarma', ['copy:karma', 'karma:test', 'clean:karma']

  grunt.registerTask 'dev', ['compile', 'testMocha', 'watch:coffee']
  grunt.registerTask 'dev:karma', ['testKarma', 'watch:karma']

  grunt.registerTask 'default', ['compile', 'testMocha', 'testKarma']
  grunt.registerTask 'release', ['version:library', 'version:bower', 'compile']
