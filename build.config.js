/**
 * This file/module contains all configuration for the build process.
 */

module.exports = {
  public_dir: 'public',
  harp_prod: '/home/barton/Dropbox/harp.io/apps/myfamilyvoice.harp.io/',
  harp_dev: '/home/barton/Dropbox/harp.io/apps/familyvoice.harp.io/',
  harp_src: 'harp.io',
  parse_dir: 'cloud',
  fv: {
    js: [ 'js/**', '*.js', 'main/**/*.js','navbar/**/*.js', 'login/**/*.js',
          'admin/**/*.js', 'models/**/*.js', 'confirmEmail/**/*.js',
        'account/**/*.js', 'activities/**/*.js', 'search/**/*.js',
        'directives/**/*.js', 'family/**/*.js', 'register/**/*.js',
        'factory/**/*.js', 'filters/**/*.js'],
    css: ['styles/*.css'],
    devCloudConfig: 'cloudCode/configDev.js',
    prodCloudConfig: 'cloudCode/configProd.js',
    devAngularConfig:'config/devAngularConfig.js',
    prodAngularConfig:'config/prodAngularConfig.js',
    javaScriptInclude: 'config/includeJavaScript.html',
    images: ['images/*.png', 'images/*.jpg', 'images/*.gif']
  },

  vendor: {
    js: [
      'bower_components/jquery/jquery.min.js',
      'bower_components/angular/angular.min.js',
      'bower_components/bootstrap/dist/js/bootstrap.min.js',
      'bower_components/angular-route/angular-route.min.js',
      'bower_components/angular-sanitize/angular-sanitize.min.js',
      'bower_components/underscore/underscore-min.js',
    ],
    css: [
      'bower_components/bootstrap/dist/css/bootstrap.css'
    ],
    img: [

    ],
    fonts: [ 'fonts/*.*' ]
  }

};
