/**
 * This file/module contains all configuration for the build process.
 */

module.exports = {
  public_dir: 'public',
  server_dir: 'server',
  parse_dir: 'cloud',
  fv: {
    js: [ 'js/**', '*.js', 'main/**/*.js','navbar/**/*.js', 'login/**/*.js',
          'admin/**/*.js', 'models/**/*.js', 'confirmEmail/**/*.js',
        'account/**/*.js',  'search/**/*.js',
        'directives/**/*.js', 'family/**/*.js', 'register/**/*.js',
        'factory/**/*.js', 'filters/**/*.js', 'referral/**/*.js',
        'wizard/**/*.js'],
    css: ['styles/*.css'],
    devCloudConfig: 'cloudCode/configDev.js',
    nodeCloudConfig: 'cloudCode/configNode.js',
    prodCloudConfig: 'cloudCode/configProd.js',
    devAngularConfig:'config/devAngularConfig.js',
    devNodeAngularConfig:'config/devNodeAngularConfig.js',
    prodAngularConfig:'config/prodAngularConfig.js',
    javaScriptInclude: 'config/includeJavaScript.html',
    images: ['images/*.png', 'images/*.jpg', 'images/*.gif']
  },

  vendor: {
    js: [
      'bower_components/jquery/jquery.min.js',
      'bower_components/jquery/jquery.min.map',
      'bower_components/angular/angular.min.js',
      'bower_components/angular/angular.min.js.map',
      'bower_components/bootstrap/dist/js/bootstrap.min.js',
      'bower_components/angular-route/angular-route.min.js',
      'bower_components/angular-route/angular-route.min.js.map',
      'bower_components/angular-sanitize/angular-sanitize.min.js',
      'bower_components/angular-sanitize/angular-sanitize.min.js.map',
      'bower_components/underscore/underscore-min.js',
      'bower_components/underscore/underscore-min.map',
      'bower_components/jquery-cookie/jquery.cookie.js'
    ],
    css: [
      'bower_components/bootstrap/dist/css/bootstrap.min.css'
    ],
    img: [

    ],
    fonts: [ 'fonts/*.*' ]
  }

};
