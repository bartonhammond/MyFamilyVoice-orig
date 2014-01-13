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
    project: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'public'
    },
    shell: {
      parseDevelop: {
        command: 'parse deploy FamilyVoice',
        options: {
          stdout: true
        }
      },
      parseProduction: {
        command: 'parse deploy MyFamilyVoice',
        options: {
          stdout: true
        }
      }
    },
    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= fv.js %>', 'app/js/*.js'],
        tasks: ['newer:jshint:all', 'newer:copy:fvJs'],
        options: {
          cwd: 'app'
        }
      },
      views: {
        files: ['app/**/*.html'],
        tasks: [ 'newer:copy:fvHtml']
      },
      styles: {
        files: ['app/styles/**/*.css'],
        tasks: ['newer:copy:fvCss']
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
          base: '<%= project.dist %>'
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
        'app/scripts/{,*/}*.js'
      ]
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= project.dist %>/*'
          ]
        }]
      },
      harpDev: {
        options: {
          force: true
        },
        files: [{
          dot: true,
          src: [
            '<%= harp_dev %>/*'
          ]
        }]
      },
      harpProd: {
        options: {
          force: true
        },
        files: [{
          dot: true,
          src: [
            '<%= harp_prod %>/*'
          ]
        }]
      }
    },
    // Copies remaining files to places other tasks can use
    copy: {
      configDev: {
        files: [
          {
            src: ['<%= fv.prodAngularConfig %>'],
            dest: '<%= public_dir %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/config/config.js';
            }
          },
          {
            src: ['<%= fv.prodCloudConfig %>'],
            dest: '<%= parse_dir %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/config.js';
            }
          },
          {
            src: ['<%= fv.prodCloudCode %>'],
            dest: '<%= parse_dir %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/main.js';
            }
          }
        ]
      },
      configProd: {
        files: [
          {
            src: ['<%= fv.devAngularConfig %>'],
            dest: '<%= public_dir %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/config/config.js';
            }
          },
          {
            src: ['<%= fv.devCloudConfig %>'],
            dest: '<%= parse_dir %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/config.js';
            }
          },
          {
            src: ['<%= fv.devCloudCode %>'],
            dest: '<%= parse_dir %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/main.js';
            }
          }
        ]
      },
      harpRootDev: {
        expand: true,
        flatten: false,
        src: '*.*',
        dest: '<%= harp_dev %>',
        cwd: '<%= public_dir %>'
      },
      harpRootProd: {
        expand: true,
        flatten: false,
        src: '*.*',
        dest: '<%= harp_prod %>',
        cwd: '<%= public_dir %>'
      },
      harpDev: {
        expand: true,
        flatten: false,
        src: '*/**',
        dest: '<%= harp_dev %>',
        cwd: '<%= public_dir %>'
      },
      harpProd: {
        expand: true,
        flatten: false,
        src: '*/**',
        dest: '<%= harp_prod %>',
        cwd: '<%= public_dir %>'
      },
      harpJsonProd: {
        expand: true,
        src: '*',
        dest: '<%= harp_prod %>',
        cwd: '<%= harp_src %>'
      },
      fvHtml: {
        files: [
          {
            src: ['**/*.html', '**/*.ico', '**/*.png'],
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
      fvImages: {
        files: [
          {
            src: '<%= fv.images %>',
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
      },
      vendorFonts: {
        files: [
          {
            src: ['<%= vendor.fonts %>'],
            dest: '<%= public_dir %>/fonts',
            cwd: '.',
            expand: true,
            flatten: true
          }
        ]
      }
    }
  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  grunt.registerTask('serve', function () {
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
      'copy:configDev',
      'copy:fvHtml',
      'copy:fvJs',
      'copy:fvCss',
      'copy:fvImages',
      'copy:vendorCss',
      'copy:vendorJs',
      'copy:vendorImg',
      'copy:vendorFonts'
    ]);
  });
  grunt.registerTask('harpdev', function () {
    grunt.task.run([
      'dist',
      'clean:harpDev',
      'copy:harpRootDev',
      'copy:harpDev',
      'copy:configDev',
      'shell:parseDevelop'
    ]);
  });

  grunt.registerTask('harpprod', function () {
    grunt.task.run([
      'dist',
      'clean:harpProd',
      'copy:harpRootProd',
      'copy:harpProd',
      'copy:harpJsonProd',
      'copy:configProd',
      'shell:parseProduction'
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
