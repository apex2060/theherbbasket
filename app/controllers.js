var MainCtrl = app.controller('MainCtrl', function($rootScope, $scope, $routeParams, $http, userService, storeService, categoryService, productService){
	var tools = {
		hash: function(url){
			window.location.hash = url;
		},
		rp:function(param){
			if($routeParams[param])
				return $routeParams[param];
			else
				return 'main';
		},
		active:function(loc){
			if(window.location.hash.split('/')[1]==loc)
			return 'active';
		},
		url:function(){
			return 'views/'+$routeParams.view+'.html';
		},
		setTheme: function(theme){
			document.getElementById('themeCSS').href='/css/themes/'+theme+'.css';
		},
		setup:function(){
			$rootScope.data={store:{},education:{}};
			tools.category.parseList();
			tools.product.parseList();
			tools.store.featured.parseList();
		},
		user: userService,
		store: storeService,
		category: categoryService,
		product: productService
	}
	$scope.tools = tools;

	if($rootScope.user==undefined)
		$scope.tools.user.init();

	if(!$rootScope.data.store)
		tools.setup();
	setup();

	it.MainCtrl=$scope;
});



var StoreCtrl = app.controller('StoreCtrl', function($rootScope, $scope, $routeParams, $http, storeService, categoryService, productService){
	$scope.view = $routeParams.view;
	$scope.id = $routeParams.id;
	$scope.subId = $routeParams.subId;

	var tools = {
		hash: function(url){
			window.location.hash = url;
		},
		store: storeService,
		category: categoryService,
		product: productService
	}
	$scope.tools = tools;

	if($scope.view=='product' && $routeParams.id)
		$rootScope.$watch('data.store.products', function (products) {
			$scope.product = tools.product.get($routeParams.id);
		}, true);

	if($scope.view=='category' && $routeParams.id)
		$rootScope.$watch('data.store.categories', function (categories) {
			$scope.category = tools.category.get($routeParams.id);
		}, true);


	it.StoreCtrl=$scope;
});

var EducationCtrl = app.controller('EducationCtrl', 
	function($rootScope, $scope, $routeParams, $http, productService, articleService, fileService){
		$scope.view = $routeParams.view;
		$scope.id = $routeParams.id;

		var tools = {
			hash: function(url){
				window.location.hash = url;
			},
			article:articleService,
			product: productService,
			file: fileService
		}
		$scope.tools = tools;


		it.EducationCtrl=$scope;
	}
);

var CommunityCtrl = app.controller('CommunityCtrl', function($rootScope, $scope, $routeParams, $http, angularFire){
	$scope.view = $routeParams.view;
	$scope.id = $routeParams.id;

	var tools = {
		hash: function(url){
			window.location.hash = url;
		}
	}
	$scope.tools = tools;


	it.CommunityCtrl=$scope;
});