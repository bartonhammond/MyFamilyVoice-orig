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

  // Ability to check which branch we're on
  grunt.loadNpmTasks('grunt-checkbranch');
  
  //Concat files 
  grunt.loadNpmTasks('grunt-contrib-concat');

  //Ngmin
  grunt.loadNpmTasks('grunt-ngmin');

  //Closure compiler to minimize javascript
  grunt.loadNpmTasks('grunt-closure-compiler');
  
  //Copy only files w/ changed timestamps
  grunt.loadNpmTasks('grunt-sync');

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  var taskConfig = {

    // Project settings
    project: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      public: 'public',
      dist: 'dist',
      nodePublic: 'server/public'
    },
    // Concat all js in public -> dist
    concat: {
      dist: {
        options: {
          separator: ';',
        },
        src:
        [
          'public/fv.js',
          'public/config/config.js',
          'public/js/loading.js',
          'public/directives/timer.js',
          'public/directives/validFileType.js',
          'public/directives/validFileSize.js',
          'public/directives/qtip.js',
          'public/directives/debouce.js',
          'public/directives/recapthca.js',
          'public/filters/seconds.js',
          'public/main/MainCtrl.js',
          'public/navbar/NavbarCtrl.js',
          'public/login/LoginCtrl.js',
          'public/register/RegisterCtrl.js',
          'public/admin/AdminCtrl.js',
          'public/confirmEmail/ConfirmEmailCtrl.js',
          'public/account/AccountCtrl.js',
          'public/account/RecaptchaService.js',
          'public/activities/ActivitiesIndexCtrl.js',
          'public/activities/ActivitiesUpdateCtrl.js',
          'public/search/SearchCtrl.js',
          'public/family/FamilyIndexCtrl.js',
          'public/family/ConfirmFamilyCtrl.js',
          'public/referral/ReferralIndexCtrl.js',
          'public/referral/ReferralCreateCtrl.js',
          'public/models/Referral.js',
          'public/models/User.js',
          'public/models/Role.js',
          'public/models/Activity.js',
          'public/models/Search.js',
          'public/models/Relation.js',
          'public/models/Family.js'
        ],
        dest: '<%= project.dist %>/built.js'
      },
      html: {
        src: ['app/master.html','config/includeJavaScript.html'],
        dest: 'public/index.html'
      },
      htmlMin: {
        src: ['app/master.html','config/includeJavaScriptMin.html'],
        dest: 'public/index.html'
      }
    },
    ngmin: {
      file: {
        src: ['<%= project.dist %>/built.js'],
        dest: '<%= project.dist %>/builtngmin.js'
      }
    },
    'closure-compiler': {
      /* jshint camelcase: false */
      frontend: {
        js: 'dist/builtngmin.js',
        jsOutputFile: 'public/frontend.min.js',
        maxBuffer: 500,
        options: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS',
          language_in: 'ECMASCRIPT5_STRICT'
        }
      }
    },
    shell: {
      modulusDevelop: {
        command: [
          'modulus login --username bartonhammond@gmail.com --password Parkl1fe!  --github',
          'modulus project deploy --project-name FamilyVoice'
        ].join('&&'),
        options: {
          stdout: true,
          execOptions: {
            cwd: 'server'
          }
        }
      },
      modulusProd: {
        command: [
          'modulus login --username bartonhammond@gmail.com --password Parkl1fe!  --github',
          'modulus project deploy --project-name MyFamilyVoice'
        ].join('&&'),
        options: {
          stdout: true,
          execOptions: {
            cwd: 'server'
          }
        }
      },

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
    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        'cloud/main.js',
        'app/**/*.js',
        'app/*.js',
        '!app/js/**'
      ]
    },

    // Empties folders to start fresh
    clean: {
      public: {
        files: [{
          dot: true,
          src: [
            '<%= project.public %>/*'
          ]
        }]
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= project.dist %>/*'
          ]
        }]
      },
      nodePublic: {
        files: [{
          dot: true,
          src: [
            '<%= project.nodePublic %>/*'
          ]
        }]
      }

    },
    sync: {
      publicToNode: {
        expand: true,
        flatten: false,
        src: ['*.*', '*/**'],
        dest: 'server/public',
        cwd: '<%= public_dir %>'
      },
      fvHtml: {
        files: [
          {
            src: ['**/*.html', '**/*.ico', '**/*.png'],
            dest: '<%= public_dir %>',
            cwd: 'app',
            expand: true,
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
    },
    //Copy 
    copy: {
      configDev: {
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
            src: ['<%= fv.devCloudConfig %>'],
            dest: '<%= server_dir %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/config.js';
            }
          }
        ]
      },
      configNode: {
        files: [
          {
            src: ['<%= fv.devNodeAngularConfig %>'],
            dest: '<%= public_dir %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/config/config.js';
            }
          },
          {
            src: ['<%= fv.nodeCloudConfig %>'],
            dest: '<%= parse_dir %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/config.js';
            }
          },
          {
            src: ['<%= fv.nodeCloudConfig %>'],
            dest: '<%= server %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/config.js';
            }
          }
        ]
      },
      configProd: {
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
            src: ['<%= fv.prodCloudConfig %>'],
            dest: '<%= server %>',
            cwd: '.',
            expand: true,
            rename: function(dest) {
              return dest + '/config.js';
            }
          }
        ]
      }
    }
  };

  grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

  
  grunt.registerTask('dist', function () {
    grunt.task.run([
      'clean:dist',
      'jshint',
      'copy:configDev',
      'sync:fvHtml',
      'sync:fvJs',
      'sync:fvCss',
      'sync:fvImages',
      'sync:vendorCss',
      'sync:vendorJs',
      'sync:vendorImg',
      'sync:vendorFonts'
    ]);
  });

  grunt.registerTask('devPrep', function () {
    grunt.task.run([
      'checkbranch:develop',
      'dist'
    ]);
  });

  grunt.registerTask('dev', function () {
    grunt.task.run([
      'devPrep',
      'concat:html',
      'sync:publicToNode',
      'shell:parseDevelop',
      'shell:modulusDevelop'
    ]);
  });


  grunt.registerTask('devNode', function () {
    grunt.task.run([
      'devPrep',
      'copy:configNode',
      'concat:html',
      'sync:publicToNode'
    ]);
  });

  grunt.registerTask('devMin', function() {
    grunt.task.run([
      'devPrep',
      'concat',
      'ngmin',
      'closure-compiler',
      'concat:htmlMin',
      'sync:publicToNode',
      'shell:parseDevelop',
      'shell:modulusDevelop'
    ]);
  });
  
  grunt.registerTask('devRelease', function() {
    grunt.task.run([
      'clean',
      'devMin'
    ]);
  });
  
  grunt.registerTask('prodPrep', function () {
    grunt.task.run([
      'checkbranch:master',
      'dist',
      'copy:configProd',
    ]);
  });

  grunt.registerTask('prod', function () {
    grunt.task.run([
      'prodPrep',
      'concat:html',
      'sync:publicToNode',
      'shell:parseProduction',
      'shell:modulusProd'
    ]);
  });


  grunt.registerTask('prodQuick', function () {
    grunt.task.run([
      'prodPrep',
      'concat:html',
      'sync:publicToNode'
    ]);
  });

  grunt.registerTask('prodMin', function () {
    grunt.task.run([
      'prodPrep',
      'concat',
      'ngmin',
      'closure-compiler',
      'concat:htmlMin',
      'sync:publicToNode',
      'shell:parseProduction',
      'shell:modulusProduction'
    ]);
  });
  
  grunt.registerTask('prodRelease', function() {
    grunt.task.run([
      'clean',
      'prodMin'
    ]);
  });
  
  grunt.registerTask('default', [
    'jshint'
  ]);

};
