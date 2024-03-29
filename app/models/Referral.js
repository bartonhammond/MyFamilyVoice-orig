'use strict';
angular.module('fv').
  factory('Referral', function($q) {
    
    var Referral = function(referral) {
      if (!_.isUndefined(referral)) {
        this.referral = referral;
        this.email = referral.get('email');
        this.user = referral.get('user');
        this.referredUser = referral.get('referredUser');
        this.firstName = referral.get('firstName');
        this.lastName = referral.get('lastName');
        this.emailSent = referral.get('emailSent');
        this.updatedAt = referral.updatedAt;
        this.createdAt = referral.createdAt;
      }
      /**
       * Create a referral and an associated user so that activities
       * can be associated
       */
      this.createReferral = function() {
        var defer = $q.defer();
        Parse.Cloud.run('createReferral',
                        {email: this.email,
                         firstName: this.firstName,
                         lastName: this.lastName})
          .then(
            function(referral) {
              defer.resolve(referral);
            },
            function(error) {
              defer.rejecot(error);
            });
        return defer.promise;
      };
      /**
        * the referred user is registering so 
        * update the User record with the correct info
        */
      this.updateReferredUser = function(username,
                                         password,
                                         isSocial,
                                         referralLink,
                                         firstName,
                                         lastName,
                                         primaryEmail) {

        var defer = $q.defer();
        Parse.Cloud.run('updateReferredUser',
                        {username: username,
                         password: password,
                         isSocial:isSocial,
                         link: referralLink,
                         firstName: firstName,
                         lastName: lastName,
                         primaryEmail: primaryEmail
                        })
          .then(
            function(referredUser) {
              defer.resolve(referredUser);
            },
            function(error) {
              defer.reject(error);
            });
        return defer.promise;
      };
      this.sendReferralEmail = function() {
        var defer = $q.defer();
        Parse.Cloud.run('sendReferralEmail',
                        {id: this.referral.id})
          .then(
            function(referral) {
              defer.resolve(referral);
            },
            function(error) {
              defer.reject(error);
            });
        return defer.promise;
      };
      /**
       * Get all referrals
       */
      this.list = function(user) {
        var defer = $q.defer();
        var Referral = Parse.Object.extend('Referral');
        var query = new Parse.Query(Referral);
        query.equalTo('user', user);
        query.descending('updatedAt');
        
        query.find()
          .then(
            function(referrals) {
              defer.resolve(referrals);
            },
            function(aError) {
              defer.reject(aError);
            });
        
        return defer.promise;
      };
    };
    return Referral;
  });
