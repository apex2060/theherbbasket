app.factory('fireParse', function ($rootScope, $timeout, $routeParams, $http) {
	/*
	 *	REQUIRES:
	 *	userSettingsModal
	*/
	var config = {
		fireRoot: 'https://theherbbasket.firebaseio.com',
		parseAppId: 'dqnxDqfyQDgXoB8xi2AF9sF8AtqWboBb6WmxcQYN',
		parseJsKey: '5MUNzhiZtqrVVQR5G7j1YzWzl6q2lZ50nhLuw87c',
		parseRestApiKey: 'bn1ovkG2FmaxDj3dKRo9dFbFpwCJg3KypOXngdki'
	};

	Parse.initialize(config.parseAppId, config.parseJsKey);
	$http.defaults.headers.common['X-Parse-Application-Id'] = config.parseAppId;
	$http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
	$http.defaults.headers.common['Content-Type'] = 'application/json';

	var fireParse = {
		config: config,
		fireRoot: new Firebase(config.fireRoot),
		user:{
			init:function(){
				fireParsefireAuth = new FirebaseSimpleLogin(fireParse.fireRoot, function(error, data) {
					if (error) {
						console.log(error);
					} else if (data) {
						console.log('FireAuth has been authenticated!')
						if(localStorage.user){
							var localUser = angular.fromJson(localStorage.user);
							$http.defaults.headers.common['X-Parse-Session-Token'] = localUser.sessionToken;
						}
						fireParse.user.initParse(data);
					} else {
						console.log('not logged in.');
					}
				});
			},
			initParse:function(){
				$http.get('https://api.parse.com/1/users/me').success(function(data){
					$rootScope.user = data;
				}).error(function(){
					//User not authenticated any more...
					//???Clear user data???
				});
			},
			signupModal:function(){
				$('#userSignupModal').modal('show');
			},
			signup:function(user){
				signupParse(user)
			},
			signupParse:function(user){
				user.username = user.email;
				if(user.password!=user.password1){
					notify('error','Your passwords do not match.');
				}else{
					delete user.password1;
					$http.post('https://api.parse.com/1/users', user).success(function(data){
						user.signupFire(user);
					}).error(function(error, data){
						console.log('signupParse error: ',error,data);
					});
				}
			},
			signupFire:function(user){
				fireParse.user.auth.createUser(user.email, user.password, function(error, data) {
					if(error)
						console.log('signupFire error: ',error,data)
					else
						fireParse.user.login(user);
				});
			},
			loginModal:function(){
				$('#userLoginModal').modal('show');
			},
			login:function(user){
				fireParse.user.loginParse(user);
			},
			loginParse:function(user){
				var login = {
					username:user.email,
					password:user.password
				}
				$http.get("https://api.parse.com/1/login", {params: login}).success(function(data){
					$http.defaults.headers.common['X-Parse-Session-Token'] = data.sessionToken;
					localStorage.user=angular.toJson(data);
					$rootScope.user=data;
					fireParse.user.loginFire(user);
				}).error(function(){
					// $('#loading').removeClass('active');
				});
			},
			loginFire:function(user){
				fireParse.user.auth.login('password', {
					email: user.email,
					password: user.password
				});
			},
			settings:function(){
				$('#userSettingsModal').modal('show');
			}
		},
		product:{
			detailsModal:function(){
				$('#productDetailsModal').modal('show');
			},
			createProduct:function(content){
				console.log('hi')
				console.log('createProduct',content)
			},
			fileDrop:function(details,b64){
				console.log('uploadFile 1.2',details,b64);

				$rootScope.temp.file = {
					b64:b64,
					name:details.name,
					type:details.type,
					size:details.size
				}

				var file = new Parse.File(details.name, { base64: b64});
				file.save().then(function(data) {
					it.fileData = data;
					console.log('save success',data)
					$rootScope.temp.file.url = data._url;
				}, function(error) {
					console.log('save error',error)
					$rootScope.temp.file.error = error;
				});
			}
		}
	}
	it.fireParse = fireParse;
	return fireParse;
});