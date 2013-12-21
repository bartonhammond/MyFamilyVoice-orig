/* jshint ignore:start */
angular.module('fv')
  .controller('RegisterCtrl', function ($rootScope, $scope, RegisterUser, Auth, $location) {
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
          var registerUser = {};
          registerUser.provider = data.Provider;
          registerUser.providerId = data.ID;
          registerUser.firstName = data.FirstName;
          registerUser.lastName = data.LastName;
          
          var email = _.find(data.Email,function(address) {
            console.log('find: ' + address);
              return address.Type === 'Primary';
          });
          if (email) {
            registerUser.primaryEmail = email.Value;
            console.log(registerUser);
            RegisterUser.create({}).$call('registerSocialLogin',registerUser).then(
              function(data) {
                console.log('SuccessfullyLogin success');
                console.log(data);
                //Register and subsequently login
                Auth.register({
                  username: data.result.primaryEmail,
                  password: data.result.password,
                  verifiedEmail: false}).then(
                    function(){
                      if ($scope.$$phase || $scope.$root.$$phase) {
                        $scope.$eval($location.path('/activities'));
                      } else {
                        $scope.$apply($location.path('/activities'));
                      }
                    }, function(response) {
                      $('#error').text(response.data.error);
                    });
                
              }, function(response) {
                console.log('SuccessfullyLogin: error: ');
                console.log(response);
                $('#error').text(response.data.error);
              });
          } else {
            $rootScope.registerUser = registerUser;
            
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
        $scope.registerUser.verifiedEmail = false;
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
