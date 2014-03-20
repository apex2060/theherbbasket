var MainCtrl = app.controller('MainCtrl', function($rootScope, $scope, $routeParams, $http, userService, storeService, categoryService, productService, dataService){
	$rootScope.view = $routeParams.view;
	$rootScope.id = $routeParams.id;
	$rootScope.subId = $routeParams.subId;

	function setup(){
		console.log('Setting Up Data!', $rootScope.data)
		if($rootScope.user==undefined)
			$scope.tools.user.init();
		if(!$rootScope.data){
			$rootScope.temp = {}
			$rootScope.data = {
				education: 	{},
				community: 	{},
				store: 		{},
				cart: 		[],
				blog: 		{},
			}
			
			//SETUP RESOURCES
			$rootScope.r = {}
			var articles = new dataService.resource('Article', 'articleList', true, true);
			$rootScope.r.articles = articles;
			articles.item.list().then(function(data){
				$rootScope.data.education.articles = data;
			})
			$rootScope.$on(articles.listenId, function(event, data){
				$rootScope.data.education.articles = data;
			})

			var herbCategories = new dataService.resource('category', 'herbCategoryList', true, true);
			$rootScope.r.herbCategories = herbCategories;
			herbCategories.item.list().then(function(data){
				$rootScope.data.store.categories = data.results;
			})
			$rootScope.$on(herbCategories.listenId, function(event, data){
				$rootScope.data.store.categories = data.results;
			})

			var products = new dataService.resource('product', 'productList', true, true);
			$rootScope.r.products = products;
			products.item.list().then(function(data){
				$rootScope.data.store.products = data.results;
			})
			$rootScope.$on(products.listenId, function(event, data){
				$rootScope.data.store.products = data.results;
			})
		}
	}


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
			// $rootScope.data={store:{},education:{}};
			// tools.category.parseList();
			// tools.product.parseList();
			// tools.store.featured.parseList();
			// setup();
		},
		user: userService,
		store: storeService,
		category: categoryService,
		product: productService
	}
	$scope.tools = tools;
	setup();
	it.MainCtrl=$scope;
});












var StoreCtrl = app.controller('StoreCtrl', function($rootScope, $scope, $routeParams, $http, $sce, storeService, categoryService, productService){
	var tools = {
		hash: function(url){
			window.location.hash = url;
		},
		setFeatured:function(){
			// $scope.featured = tools.product.getList($rootScope.data.store.featured);
		},
		store: storeService,
		category: categoryService,
		product: productService
	}
	$scope.tools = tools;

	if($scope.view=='product' && $routeParams.id)
		$rootScope.$watch('data.store.products', function (products) {
			$scope.product = tools.product.get($routeParams.id);
			$scope.product.description = $sce.trustAsHtml($scope.product.description);
		}, true);

	if($scope.view=='category' && $routeParams.id)
		$rootScope.$watch('data.store.categories', function (categories) {
			$scope.category = tools.category.get($routeParams.id);
		}, true);

	it.StoreCtrl=$scope;
});












var EducationCtrl = app.controller('EducationCtrl', 
	function($rootScope, $scope, $routeParams, $http, dataService, fileService){
		var tools = {
			hash: function(url){
				window.location.hash = url;
			},
			articleList: articles.item,
			article:{
				setPicture: function(details,src){
					it.details=details
					it.src=src

					if(!$rootScope.temp.newArticle)
						$rootScope.temp.newArticle = {};
					$rootScope.$apply(function(){
						$rootScope.temp.newArticle.picture = {
							temp: true,
							status: 'uploading',
							class: 'grayscale',
							name: 'Image Uploading...',
							src: src
						};
					})

					fileService.upload(details,src,function(data){
						$rootScope.$apply(function(){
							$rootScope.temp.newArticle.picture = {
								name: data.name(),
								src: data.url()
							}
						})
					});
				},
				add: function(article){
					articles.item.save(article)
					$scope.temp.article = {};
				}
			}
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