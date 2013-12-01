// Generated on 2013-11-30 using generator-angular 0.6.0-rc.2
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  /**
   * Load in our build configuration file.
   */
  var userConfig = require('./build.config.js');
  
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  var taskConfig = {

    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'public'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all']
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      dist: {
        options: {
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/*'
          ]
        }]
      }
    },
    // Copies remaining files to places other tasks can use
    copy: {
      fvHtml: {
        files: [
          {
            src: ['**/*.html'],
            dest: '<%= public_dir %>',
            cwd: 'app',
            expand: true
          }
        ]
      },
      fvJs: {
        files: [
          {
            src: '<%= fv.js %>',
            dest: '<%= public_dir %>',
            cwd: 'app',
            expand: true,
            flatten: false
          }
        ]
      },
      fvCss: {
        files: [
          {
            src: '<%= fv.css %>',
            dest: '<%= public_dir %>',
            cwd: 'app',
            expand: true,
            flatten: false
          }
        ]
      },
      vendorCss: {
        files: [
          {
            src: ['<%= vendor.css %>'],
            dest: '<%= public_dir %>/vendor/css',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      },
      vendorJs: {
        files: [
          {
            src: ['<%= vendor.js %>'],
            dest: '<%= public_dir %>/vendor',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      },
      vendorImg: {
        files: [
          {
            src: ['<%= vendor.img %>'],
            dest: '<%= public_dir %>/vendor/img',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      }
    }
  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'dist',
      'connect',
      'watch'
    ]);
  });

  grunt.registerTask('dist', function () {
    grunt.task.run([
      'clean:dist',
      'jshint',
      'copy:fvHtml',
      'copy:fvJs',
      'copy:fvCss',
      'copy:vendorCss',
      'copy:vendorJs',
      'copy:vendorImg'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });



  grunt.registerTask('default', [
    'jshint'
  ]);

};
