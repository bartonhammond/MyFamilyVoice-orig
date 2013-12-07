/**
 * This file/module contains all configuration for the build process.
 */

module.exports = {
    public_dir: 'public',
    fv: {
        js: [ '**/*.js' ],
        css: ['styles/*.css']

    },

    vendor: {
        js: [
            'bower_components/jquery/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/bootstrap/bootstrap/js/bootstrap.js',
            'bower_components/bootstrap/js/bootstrap-modal.js',
            'bower_components/angular-collection/angular-collection.js',
            'bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js',
            'bower_components/angular-strap/dist/angular-strap.js',
            'bower_components/wysihtml5/dist/wysihtml5-0.3.0.js',
            'bower_components/bootstrap-wysihtml5/dist/bootstrap-wysihtml5-0.0.2.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-sanitize/angular-sanitize.js',
            'bower_components/Papp/js/services/parse-resource.js',
            'bower_components/underscore/underscore.js',
            'bower_components/AudioRecorder/js/recorderjs/recorder.js',
            'bower_components/AudioRecorder/js/recorderjs/recorderWorker.js'
        ],
        css: [
            'bower_components/bootstrap/bootstrap/css/bootstrap.css',
            'bower_components/bootstrap-datepicker/css/datepicker.css',
            'bower_components/bootstrap-wysihtml5/dist/bootstrap-wysihtml5-0.0.2.css'
        ],
        img: [
            'bower_components/bootstrap/bootstrap/img/glyphicons-halflings.png',
            'bower_components/bootstrap/bootstrap/img/glyphicons-halflings-white.png'
        ]
    }

};
