var MainCtrl = app.controller('MainCtrl', function($rootScope, $scope, $routeParams, $http, userService, storeService, categoryService, dataService){
	$rootScope.view = $routeParams.view;
	$rootScope.id = $routeParams.id;
	$rootScope.subId = $routeParams.subId;

	function setup(){
		if($rootScope.user==undefined)
			$scope.tools.user.init();
		if(!$rootScope.data){
			console.log('Setting Up Data!')
			$rootScope.temp = {}
			$rootScope.cart = []
			$rootScope.data = {
				education: 	{},
				community: 	{},
				store: 		{},
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

			var herbCategories = new dataService.resource('category', 'herbCategoryList', true, true, 'orderBy=sequence');
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
		// product: productService
	}
	$scope.tools = tools;
	setup();
	it.MainCtrl=$scope;
});












var StoreCtrl = app.controller('StoreCtrl', function($rootScope, $scope, $routeParams, $http, $sce, storeService, categoryService){
	var tools = {
		hash: function(url){
			window.location.hash = url;
		},
		productList: $rootScope.r.products.item,
		product: {
			add: function(){
				$('#productAddModal').modal('show');
			},
			edit: function(product){
				$rootScope.temp.product = angular.fromJson(angular.toJson(product));
				delete $rootScope.temp.product.safeDescription;
				$('#productAddModal').modal('show');
			},
			save: function(tempProduct){
				tools.productList.save(tempProduct).then(function(data){
					$rootScope.product = tempProduct;
					$rootScope.product.safeDescription = $sce.trustAsHtml($rootScope.product.description);
					$('#productAddModal').modal('hide');
				})
			},
			fromCat: function(category){
				var returnArray = [];
				if($rootScope.data && $rootScope.data.store.products)
					for(var i=0; i<$rootScope.data.store.products.length; i++)
						if($rootScope.data.store.products[i].categories)
							if($rootScope.data.store.products[i].categories.indexOf(category) != -1)
								returnArray.push($rootScope.data.store.products[i])
				return returnArray;
			}
		},

		category: categoryService,
		store: storeService,
		// product: productService
	}
	$scope.tools = tools;

	if($routeParams.view=='product' && $routeParams.id){
		tools.productList.get($routeParams.id).then(function(product){
			$rootScope.product = product;
			$rootScope.product.safeDescription = $sce.trustAsHtml($rootScope.product.description);
		})
	}

	if($routeParams.view=='category' && $routeParams.id)
		tools.category.get($routeParams.id).then(function(category){
			$scope.category = category;
		})

	it.StoreCtrl=$scope;
});












var EducationCtrl = app.controller('EducationCtrl', 
	function($rootScope, $scope, $routeParams, $http, dataService, fileService){
		var tools = {
			hash: function(url){
				window.location.hash = url;
			},
			articleList: $rootScope.r.articles.item,
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
					tools.articleList.save(article)
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