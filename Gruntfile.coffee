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
      release:
        options:
          reporter: 'nyan'
        src: ['test/test_*.coffee']

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

    clean:
      build_scss: ['build_scss/']

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

    version:
      library:
        options:
          prefix: '\\s+version:\\s\"'
        src: ['./src/doofinder.coffee']
      bower:
        options:
          prefix: '\"version\":\\s\"'
        src: ['./bower.json']

  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-sass'
  grunt.loadNpmTasks 'grunt-version'

  grunt.registerTask 'default', ['coffee', 'mochaTest']
  grunt.registerTask 'css', ['copy:build_scss', 'sass:build_scss', 'clean:build_scss']
  grunt.registerTask 'release', ['version:library', 'version:bower', 'coffee:release', 'browserify', 'uglify:release']
