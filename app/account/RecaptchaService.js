'use strict';
angular.module('fv')
  .service('recaptchaService',function($http, $q) {
    var self = this;
    /**
     * Post a application type form
     */
    self.verifyRecaptcha = function(data) {
      /* jshint camelcase: false*/
      var deferred = $q.defer();
      $http({ method: 'POST',
              url: 'recaptcha',
              data:$.param({recaptcha_challenge_field: data.challenge, recaptcha_response_field: data.response }),
              headers: {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
            }).success(function() {
              deferred.resolve();
            }).error(function(err) {
              deferred.reject(err);
            });

      return deferred.promise;
    };
  });
