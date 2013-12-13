/**
 * This file/module contains all configuration for the build process.
 */

module.exports = {
  public_dir: 'public',
  fv: {
    js: [ '**/*.js' ],
    css: ['styles/*.css'],
    images: ['images/*.png', 'images/*.jpg']
  },

  vendor: {
    js: [
      'bower_components/jquery/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/angular-collection/angular-collection.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/Papp/js/services/parse-resource.js',
      'bower_components/underscore/underscore.js'
    ],
    css: [
      'bower_components/bootstrap/dist/css/bootstrap.css'
    ],
    img: [

    ],
    fonts: [ 'fonts/*.*' ]
  }

};
