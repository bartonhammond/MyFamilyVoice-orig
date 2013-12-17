    /* jshint ignore:start */
angular.module('fv')
  .controller('LoginCtrl', function ($scope, Auth, $location) {
    /**
     *  loginRadius
     */
    var  loginRadius = function() {

      var options={};      
      options.login=true;       
      LoginRadius_SocialLogin.util.ready(function () { 
        $ui = LoginRadius_SocialLogin.lr_login_settings;
        $ui.interfacesize = "small";
        $ui.apikey = "cf3d185d-0ab6-45f1-9b52-d62cb26157ac";
        $ui.callback=""; 
        $ui.lrinterfacecontainer ="interfacecontainerdiv"; 
        LoginRadius_SocialLogin.init(options);  
      }); 
      
      LoginRadiusSDK.onlogin = Successfullylogin;
      
      function Successfullylogin() {
        LoginRadiusSDK.getUserprofile(function (data) {
          console.log(JSON.stringify(data));
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
   });
    /* jshint ignore:end */
