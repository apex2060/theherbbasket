var MainCtrl = app.controller('MainCtrl', function($rootScope, $scope, $routeParams, $http, fireParse, angularFire){
	$rootScope.temp={};
	console.log('routeParams',$routeParams)
	var tools = {
		url:function(){
			return 'views/'+$routeParams.view+'.html';
		},
		setTheme: function(theme){
			document.getElementById('themeCSS').href='/css/themes/'+theme+'.css';
		},
		user: fireParse.user,
		category: fireParse.category,
		product: fireParse.product
	}
	$scope.tools = tools;
	if($rootScope.user==undefined)
		$scope.tools.user.init();
	setup();
	it.MainCtrl=$scope;
});