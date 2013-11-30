'use strict';

angular.module('parseApp')
  .service('Logout', function Logout(ActivityCollection, TagCollection) {

    //empty out the collections on logout so private data is not visible to the next user
    this.logout = function() {
      console.log('reset');
      ActivityCollection._reset();
      TagCollection._reset();
    }

  });
