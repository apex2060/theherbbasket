var MainCtrl = app.controller('MainCtrl', function($rootScope, $scope, $routeParams, angularFire){
	$rootScope.temp={};
	var config = {
		fireRoot: 'https://MYAPPNAME.firebaseio.com',
		parseApiKey: 'PARSEAPIKEY',
		parseRestApiKey: 'PARSERESTAPIKEY'
	};
	
	$http.defaults.headers.common['X-Parse-Application-Id'] = config.parseApiKey;
	$http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
	$http.defaults.headers.common['Content-Type'] = 'application/json';

	$scope.tools = {
		url:function(){
			return 'views/'+$routeParams.view+'.html';
		},
		setTheme: function(theme){
			document.getElementById('themeCSS').href='/css/themes/'+theme+'.css';
		},
		init:function(){
			if(navigator.onLine){
				var auth = new FirebaseSimpleLogin(fireRoot, function(error, user) {
				if (error) {
					console.log(error);
				} else if (user) {
						$rootScope.user = user;
						$rootScope.$broadcast('authComplete');
					} else {
						console.log('not logged in.');
						//Request Login..
						// auth.login('anonymous');
					}
				});
			}else{
				if(localStorage.user){
					$rootScope.user = angular.fromJson(localStorage.user)
				}else{
					$http.get("https://api.parse.com/1/classes/userFavorites", {params: where}).success(function(data){
						localStorage.favorites=angular.toJson(data.results);
						$rootScope.favorites=data.results;
						$rootScope.$broadcast('userOnline', data);
					});
				}

				if($rootScope.user.settings.name=='Guest User')
					$scope.tools.user.settings();
				$rootScope.$broadcast('authComplete');
			}
		},
		user:{
			init:function(){
				if(navigator.onLine){
					$http.get("https://api.parse.com/1/classes/userFavorites", {params: where}).success(function(data){
						localStorage.favorites=angular.toJson(data.results);
						$rootScope.favorites=data.results;
						$rootScope.$broadcast('userOnline', data);
					});
				}else{
					
				}
			},
			settings:function(){
				$('#userSettingsModal').modal('show');
			},
			save:function(){
				if(navigator.onLine){
					var userRef = new Firebase(config.fireRoot+'/presence/'+$rootScope.user.id);
					userRef.set(angular.fromJson(angular.toJson($rootScope.user.settings)));
				}
				localStorage.user = angular.toJson($rootScope.user);
				$('#userSettingsModal').modal('hide');
			}
		}
	}
	if($rootScope.user==undefined)
		$scope.tools.init();
	it.MainCtrl=$scope;
});