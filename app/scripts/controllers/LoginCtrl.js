    /* jshint ignore:start */
angular.module('fv')
  .controller('LoginCtrl', function ($scope, $rootScope, Auth, $location) {
    /**
     *  loginRadius
     */
    var  loginRadius = function() {

      var options={};      
      options.login=true;       
      LoginRadius_SocialLogin.util.ready(function () { 
        $ui = LoginRadius_SocialLogin.lr_login_settings;
        $ui.interfacesize = "";
        $ui.apikey = "f36321df-34bc-4c0a-9a0b-aac96ccfa9ac";
        $ui.callback=""; 
        $ui.lrinterfacecontainer ="interfacecontainerdiv"; 
        LoginRadius_SocialLogin.init(options);  
      }); 
      
      LoginRadiusSDK.onlogin = Successfullylogin;
      
      function Successfullylogin() {
        LoginRadiusSDK.getUserprofile(function (data) {
          console.log(JSON.stringify(data));
          $rootScope.user = data;
          if ($scope.$$phase || $scope.$root.$$phase) {
            $scope.$eval($location.path('/account'));
          } else {
            $scope.$apply($location.path('/account'));
          }
          
        });
         return false;
      };  
    }
    /**
     * Init loginRadius
     */
    $scope.init = function() {
      LoginRadius_SocialLogin.util.ready(loginRadius);
    }
    /**
     *  Login
     */
    $scope.login = function() {
   
/**
      Auth.login($scope.loginUser).then(function() {
        $location.path('/activities');
      }, function(response) {
        $scope.error = response.data.error;
      });
*/
    };
    $scope.register = function() {
      $location.path('/register');
    }
   });
    /* jshint ignore:end */
