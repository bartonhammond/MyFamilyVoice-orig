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
      /**
{"ID":"112845155672155697294","Provider":"google","Prefix":null,"FirstName":"Barton","MiddleName":null,"LastName":"Hammond","Suffix":null,"FullName":"Barton
      Hammond","NickName":null,"ProfileName":null,"BirthDate":null,"Gender":"U","ImageUrl":null,"ThumbnailImageUrl":null,"Email":[{"Type":"Primary","Value":"admin@myfamilyvoice.com"}],"Country":null,"LocalCountry":"United
      States","ProfileCountry":null} 
*/
      function Successfullylogin() {
        LoginRadiusSDK.getUserprofile(function (data) {
          console.log(JSON.stringify(data));
          registerUser = {};
          registerUser.username = data.FullName;
          registerUser.provider = data.Provider;
          registerUser.firstName = data.FirstName;
          registerUser.lastName = data.LastName;
          
          if (_.isArray(data.Email)
             && !_.isUndefined(data.Email[0])) {
            registerUser.email = data.Email[0].Value;

            Auth.register($scope.registerUser).then(function(){
              $location.path('/activities');
            }, function(response) {
              $scope.error = response.data.error;
            });
          } else {
            $rootScope.registerUser = registerUser;
            $rootScope.registerUser.authdata= {
              "anonymous": {
                "id": $rootScope.data.ID
              }
            };
            if ($scope.$$phase || $scope.$root.$$phase) {
              $scope.$eval($location.path('/account'));
            } else {
              $scope.$apply($location.path('/account'));
            }
          };
          
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
