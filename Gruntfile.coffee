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

    exec:
      cmd: 'browserify --standalone doofinder lib/doofinder.js > dist/doofinder.standalone.js'

    mochaTest:
      options:
        reporter: 'nyan'
      src: ['test/tests.coffee']

    

    uglify:
      dist:
        files:
          'dist/doofinder.min.js': ['dist/doofinder.standalone.js']

    versioner:
      options:
        bump: true
        file: 'package.json'
        gitAdd: true
        gitCommit: true,
        gitPush: true,
        gitTag: true,
        gitPushTag: true,
        tagPrefix: 'v'
        commitMessagePrefix: 'Release: '
        tagMessagePrefix: 'Version: '
        readmeText: 'Current Version: '
        pushTo: 'origin'
        branch: 'master'
        npm: true
        mode: 'production'

      default:
        './package.json': ['./package.json']
        './README.md': ['./README.md']
        './dist/doofinder.min.js': ['./dist/doofinder.min.js']

      patch:
        options:
          file: './VERSION'

        src: ['./package.json', './README.md']



  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-exec'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks('grunt-versioner');

  grunt.registerTask 'default', ['coffee', 'mochaTest']
  grunt.registerTask 'build_for_client', ['exec', 'uglify']