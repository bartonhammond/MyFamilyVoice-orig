/* jshint ignore:start */
angular.module('fv')
  .controller('RegisterCtrl', function ($rootScope, $scope, Auth, $location) {
       /**
     *  loginRadius
     */
    var  loginRadius = function() {
      var options={};      
      options.login=true;       
      LoginRadius_SocialLogin.util.ready(function () { 
        $ui = LoginRadius_SocialLogin.lr_login_settings;
        $ui.interfacesize = "small";
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
          $rootScope.user.authdata= {
            "anonymous": {
              "id": $rootScope.user.ID
            }
          };
          if ($scope.$$phase || $scope.$root.$$phase) {
            $scope.$eval($location.path('/account'));
          } else {
            $scope.$apply($location.path('/account'));
          }
          
        });
         return false;
      };  
    }
    $scope.init = function () {
      $scope.confirmPassword='';
      loginRadius();
    };
    $scope.passwordsMatch = function() {
      return  _.isEqual($scope.signupForm.confirmpasswd.$viewValue,
                        $scope.signupForm.passwd.$viewValue);
    };
    $scope.register = function () {
      if ($scope.signupForm.$valid && $scope.passwordsMatch()) {
        Auth.register($scope.registerUser).then(function(){
          $location.path('/activities');
        }, function(response) {
          $scope.error = response.data.error;
        });
      } else {
        $scope.signupForm.submitted = true;
        
      }
    };
 
  });
    /* jshint ignore:end */
