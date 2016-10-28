/* global angular, document, window */
'use strict';

angular.module('starter.controllers', ['toaster','btford.socket-io'])
.factory('apiFactory',['$http',function ($http) {
    var urlBase = 'http://chat.passionistas.in/api/v1';
    var methods = {};

    methods.post = function (url, data) {
       return $http.post(urlBase + url, data);
    };

    return methods;
}])
.factory('Auth', function () {
  var auth = {};
  auth.user = function () {
    var user = window.localStorage.getItem('auth');
    if(user)
        return JSON.parse(user);
    else
        return {};
  }
  return auth;
})
.factory('socket',function(socketFactory){
  var mySocket = {};
	//Create socket and connect to http://chat.socket.io
 	var myIoSocket = io.connect('159.203.78.168:3000');
  	mySocket = socketFactory({
    	ioSocket: myIoSocket
  	});
	return mySocket;
})
.controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout, toaster, $ionicLoading, Auth, $state) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.invite = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;
    var txtInput, footerBar;
    // window.localStorage.setItem('auth', JSON.stringify({token:'V6IOZFjORKusv0n3diHOlyh9BjG8I8y5WYmCk2yuODIXfVkLBZMQdS4tHei5', id:1, profile_picture:'https://lh6.googleusercontent.com/-jNeMnnJavvM/AAAAAAAAAAI/AAAAAAAAATA/4zLWVQvunVE/photo.jpg?sz=50', name:'Shekhar Singh'}))
    // $timeout(function() {
    //     footerBar = document.body.querySelector('form');
    //     txtInput = angular.element(footerBar.querySelector('ion-md-input'));
    //   }, 0);


    $scope.keepKeyboardOpen = function () {
      console.log('keepKeyboardOpen');
      // txtInput.one('blur', function() {
      //   console.log('textarea blur, focus back on it');
      //   console.log(txtInput[0]);
      //   txtInput[0].focus();
      // });
    };

    if(!Auth.user().id) {
        $state.go('app.login');
    }
    $scope.logout = function () {
      window.localStorage.setItem('auth', JSON.stringify({}));
      $state.go('app.login');
    }
    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    $scope.loader = function (obj)
    {
        if(obj.show) {
          $ionicLoading.show({
            content: obj.content || 'Loading',
            animation: obj.animation || 'fade-in',
            showBackdrop: obj.showBackdrop || true,
            maxWidth: obj.maxWidth || 200,
            showDelay: obj.showDelay || 0
          });
        } else {
          $ionicLoading.hide();
        }
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };

})

.controller('LoginCtrl', function($scope, $timeout, $stateParams, ionicMaterialInk, apiFactory, $state, Auth, toaster) {
     if(Auth.user().id) {
         $state.go('app.invite');
     }
    $scope.$parent.clearFabs();
    $scope.error = {};
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();

    $scope.loginUser = function () {
      $scope.loader({show:true});
      apiFactory.post('/login', $scope.loginData)
            .success(function (response) {
              $scope.error = {};
              window.localStorage.setItem('auth', JSON.stringify(response));
              $scope.loader({show:false});
              $state.go('app.invite');
            })
            .error(function(error, status) {
              $scope.error = error;
              $scope.loader({show:false});
              if(error.message)
                toaster.pop('error', 'Error', error.message);
          });
    }
})

.controller('FriendsCtrl', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion, apiFactory, Auth, toaster) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.$parent.setHeaderFab('left');
    $scope.friends = {};
    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);
    $scope.getfriends = function () {
      $scope.loader({show:true});
      apiFactory.post('/friends', {'api_token':Auth.user().token})
                .success(function(response){
                  $scope.friends = response;
                  $scope.loader({show:false});

                  $timeout(function() {
                      // Set Motion
                      ionicMaterialMotion.fadeSlideInRight();
                      // Set Ink
                      ionicMaterialInk.displayEffect();
                  }, 0);


                })
                .error(function (error, status) {
                  $scope.loader({show:false});
                  toaster.pop('error', 'Error', error);
              });
    }
    $scope.getfriends();
})

.controller('ProfileCtrl', function($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, apiFactory, Auth) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.profile = {};
    // Set Motion
    $timeout(function() {
        ionicMaterialMotion.slideUp({
            selector: '.slide-up'
        });
    }, 300);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideInRight({
            startVelocity: 3000
        });
    }, 700);

    // Set Ink
    ionicMaterialInk.displayEffect();
    $scope.getprofile = function () {
      $scope.loader({show:true});
      apiFactory.post('/user/'+$stateParams.id, {'api_token':Auth.user().token})
                .success(function(response){
                  $scope.profile = response;
                  $scope.loader({show:false});
                })
                .error(function (error, status) {
                  $scope.loader({show:false});
              });
    }
    $scope.getprofile();
})

.controller('ActivityCtrl', function($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');

    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in .item'
        });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();
})

.controller('GalleryCtrl', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab(false);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();

    ionicMaterialMotion.pushDown({
        selector: '.push-down'
    });
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });

})

.controller('InviteCtrl', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion, apiFactory, toaster, $ionicLoading, Auth) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab(false);
    $scope.error = {};
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });

    $scope.inviteUser = function () {
      $scope.loader({show:true});
      apiFactory.post('/invite', {email: $scope.invite.email, api_token: Auth.user().token})
                .success(function(response){
                  $scope.error = {};
                  toaster.pop('success', "Invite send", "Invite send successfully");
                  $scope.loader({show:false});
                  $scope.invite.email = '';
                })
                .error(function (error, status) {
                  console.log("This is errors", error);
                  $scope.error = error.errors;
                  $scope.loader({show:false});
              });
    }

})

.controller('ChatCtrl', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion, apiFactory, toaster, $ionicLoading, Auth, $ionicScrollDelegate, socket) {
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = true;
  $scope.$parent.setExpanded(true);
  $scope.$parent.setHeaderFab(false);
  $scope.messages = {};
  $scope.user = Auth.user();
  var messageCheckTimer;
  var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
  var footerBar; // gets set in $ionicView.enter
  var scroller;
  var txtInput;
  $timeout(function() {
        footerBar = document.body.querySelector('#userMessagesView .bar-footer');
        scroller = document.body.querySelector('#userMessagesView .scroll-content');
        txtInput = angular.element(footerBar.querySelector('textarea'));
  }, 0);

  $timeout(function() {
    keepKeyboardOpen();
    viewScroll.scrollBottom(true);
  }, 0);
  if($stateParams.id)
  {
      $scope.user.receiver = $stateParams.id;
      socket.emit('setup',$scope.user);
  }

  $scope.getMessages = function () {
    $scope.loader({show:true});
    apiFactory.post('/messages', {id:$stateParams.id, api_token: Auth.user().token})
              .success(function(response){
                $scope.messages = response;
                $scope.loader({show:false});
              })
              .error(function (error, status) {
                $scope.error = error.errors;
                $scope.loader({show:false});
            });
  };

  $scope.sendMessage = function(sendMessageForm) {
      $scope.user.receiver = $stateParams.id;
      $scope.user.message  = $scope.input.message;
      socket.emit('chat',$scope.user);
      // if you do a web service call this will be needed as well as before the viewScroll calls
      // you can't see the effect of this in the browser it needs to be used on a real device
      // for some reason the one time blur event is not firing in the browser but does on devices
      keepKeyboardOpen();

      //MockService.sendMessage(message).then(function(data) {
      $scope.input.message = '';

      //message.id = new Date().getTime(); // :~)
      $scope.user.created_at = new Date();
      $scope.messages.push($scope.user);
      $timeout(function() {
        //keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 0);

      $timeout(function() {
        //$scope.messages.push(MockService.getMockMessage());
        keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 2000);

      //});
    };

  $scope.getMessages();
  socket.on('receiver', function (data) {
    $scope.messages.push(data);
    $timeout(function() {
      //$scope.messages.push(MockService.getMockMessage());
      keepKeyboardOpen();
      viewScroll.scrollBottom(true);
    }, 2000);
    console.log('Thisn is response Data');
  });

  function keepKeyboardOpen () {
    console.log('keepKeyboardOpen');
    txtInput.one('blur', function() {
      console.log('textarea blur, focus back on it');
      console.log(txtInput[0]);
      txtInput[0].focus();
    });
  };

})
;
