var MainCtrl = app.controller('MainCtrl', function($rootScope, $scope, $routeParams, $http, fireParse, angularFire){
	$rootScope.temp={};
	console.log('routeParams',$routeParams)
	var tools = {
		rp:function(param){
			if($routeParams[param])
				return $routeParams[param];
			else
				return 'main';
		},
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
	$rootScope.user = {};
	$rootScope.user.isAdmin=true;
	it.MainCtrl=$scope;
});

var CatCtrl = app.controller('CatCtrl', function($rootScope, $scope, $routeParams, $http, fireParse, angularFire){
	$scope.catId = $routeParams.catId;
	$scope.subId = $routeParams.subId;
	var tools = {
		category: fireParse.category
	}
	$scope.tools = tools;
	it.CatCtrl=$scope;
});