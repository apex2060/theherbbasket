app.factory('userService', function ($rootScope, $http, config) {
	var userService = {
		init:function(){
			if(navigator.onLine){
				userService.auth = new FirebaseSimpleLogin(config.fireRef, function(error, data) {
					if (error) {
						console.log(error);
					} else if (data) {
						// console.log('FireAuth has been authenticated!')
						$('#userLoginModal').modal('hide');
						if(localStorage.user){
							var localUser = angular.fromJson(localStorage.user);
							$http.defaults.headers.common['X-Parse-Session-Token'] = localUser.sessionToken;
						}
						userService.initParse(data);
					} else {
						// console.log('not logged in.');
						$rootScope.$broadcast('authError');
					}
				});
			}else{
				alert('You are not online!')
			}
		},
		initParse:function(){
			$http.get(config.parseRoot+'users/me').success(function(data){
				$rootScope.user = data;
				if($rootScope.user.email=='apex2060@gmail.com' || $rootScope.user.email=='jac06022@gmail.com')
					$rootScope.user.isAdmin=true;
			}).error(function(){
				//User not authenticated any more...
				//???Clear user data???
			});
		},
		signupModal:function(){
			$('#userSignupModal').modal('show');
		},
		signup:function(user){
			this.signupParse(user)
		},
		signupParse:function(user){
			user.username = user.email;
			if(user.password!=user.password1){
				notify('error','Your passwords do not match.');
			}else{
				delete user.password1;
				$http.post('https://api.parse.com/1/users', user).success(function(data){
					userService.signupFire(user);
				}).error(function(error, data){
					console.log('signupParse error: ',error,data);
				});
			}
		},
		signupFire:function(user){
			userService.auth.createUser(user.email, user.password, function(error, data) {
				if(error)
					console.log('signupFire error: ',error,data)
				else{
					$('#userSignupModal').modal('hide');
					userService.login(user);
				}
			});
		},
		loginModal:function(){
			$('#userLoginModal').modal('show');
		},
		login:function(user){
			userService.loginParse(user);
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
				userService.loginFire(user);
			}).error(function(data){
				notify('error',data.error);
				// $('#loading').removeClass('active');
			});
		},
		loginFire:function(user){
			userService.auth.login('password', {
				email: user.email,
				password: user.password
			});
		},
		settings:function(){
			$('#userSettingsModal').modal('show');
		}
	}

	it.userService = userService;
	return userService;
});


app.factory('storeService', function ($rootScope, $http, config) {
	if(!$rootScope.cart){
		$rootScope.cart = [];
	}

	var storeService = {
		addToCart:function(product){
			if(product)
				$rootScope.cart.push(product);
		},
		total:function(){
			var total = 0;
			for(var i=0; i<$rootScope.cart.length; i++)
				total += parseFloat($rootScope.cart[i].price)
			return total;
		},
		featured:{
			setupNew:function(list){
				$http.post(config.parseRoot+'classes/site', {products:list}).success(function(data){
					console.log('addFeatured',data);
					alert('The objectId for featured in the config could not be found.  Set the new config to: '+data.objectId)
					notify('The objectId for featured in the config could not be found.  Set the new config to: '+data.objectId)
					storeService.featured.parseList()
				}).error(function(data){
					console.log('Error: ',data)
				});
			},
			save:function(list){
				$http.put(config.parseRoot+'classes/site/'+config.objectIds.featured_products, {products:list}).success(function(data){
					storeService.featured.parseList();
				}).error(function(data){
					console.error('saveFeatured Error: ',data);
					if(data.code==101)
						storeService.featured.setupNew(list);
				});
			},
			parseList:function(){
				$http.get(config.parseRoot+'classes/site/'+config.objectIds.featured_products).success(function(data){
					console.log('parseList',data)
					$rootScope.data.store.featured = data.products;
				}).error(function(data){
					console.log('Error: ',data)
				});
			}
		}
	}
	
	it.storeService = storeService;
	return storeService;
});


app.factory('categoryService', function ($rootScope, $timeout, $http, config) {
	var categoryService = {
		preventDefault:function(onOff){
			if(typeof(onOff)=='string')
				this.offOn = onOff;
			else
				if(this.offOn=='on')
					onOff.preventDefault()
				else
					return;
		},
		parseList:function(){
			$http.get(config.parseRoot+'classes/category?order=sequence').success(function(data){
				$rootScope.data.categories = data.results;
			}).error(function(data){
				console.log('Error: ',data)
			});
		},
		add:function(){
			$('#categoryAddModal').modal('show');
		},
		edit:function(category){
			categoryService.preventDefault('on');
			if(category){
				$rootScope.temp.category = category;
			}
			$('#categoryAddModal').modal('show');
			$timeout(function(){
				categoryService.preventDefault('off');
			}, 1000);
		},
		save:function(){
			if(!$rootScope.data.categories)
				$rootScope.data.categories = [];
			var category = $rootScope.temp.category;
			delete category.createdAt;
			delete category.updatedAt;

			if(!category.objectId){
				category.sequence = $rootScope.data.categories.length;
				$http.post(config.parseRoot+'classes/category', angular.fromJson(angular.toJson(category))).success(function(data){
					categoryService.parseList();
				}).error(function(data){
					console.log('Error: ',data)
				});
			}else{
				$http.put(config.parseRoot+'classes/category/'+category.objectId, category).success(function(data){
					categoryService.parseList();
				}).error(function(data){
					console.log('Error: ',data)
				});
			}

			$rootScope.temp.category={};
			$('#categoryAddModal').modal('hide');
		},
		delete: function(category){
			categoryService.preventDefault('on');
			if(confirm('Are you sure you want to delete: "'+category.title+'"?')){
				if(category && category.objectId){
					$http.delete(config.parseRoot+'classes/category/'+category.objectId).success(function(data){
						console.log('Removed Object!',data);
						categoryService.parseList();
					}).error(function(data){
						console.log('Error: ',data)
					});
				}
			}
			$timeout(function(){
				categoryService.preventDefault('off');
			}, 1000);
		},
		get:function(id){
			if($rootScope.data.categories)
				for(var i=0; i<$rootScope.data.categories.length; i++)
					if($rootScope.data.categories[i].title == id)
						return $rootScope.data.categories[i];
		},
		sub:{
			add:function(category){
				if(category)
					$rootScope.temp.category = category;
				$('#categoryAddSubModal').modal('show');
			},
			edit:function(category, sub){
				categoryService.preventDefault('on');

				if(category && sub){
					alert('NOTE: All products linked to this name will not follow with the change.')
					$rootScope.temp.category = category;
					$rootScope.temp.sub = sub;
					$rootScope.temp.edit = true;
					$('#categoryAddSubModal').modal('show');
					$timeout(function(){
						categoryService.preventDefault('off');
					}, 1000);
				}
			},
			save:function(){
				var uCategory = angular.fromJson(angular.toJson($rootScope.temp.category));
				if(!uCategory.children)
					uCategory.children = [];
				if(!$rootScope.temp.edit)
					uCategory.children.push(angular.fromJson(angular.toJson($rootScope.temp.sub)));
				delete uCategory.createdAt;
				delete uCategory.updatedAt;

				$http.put(config.parseRoot+'classes/category/'+uCategory.objectId, uCategory).success(function(data){
					categoryService.parseList();
				}).error(function(data){
					console.log('Error: ',data)
				});

				$rootScope.temp.category={};
				$rootScope.temp.sub={};
				$rootScope.temp.edit=false;
				$('#categoryAddSubModal').modal('hide');
			},
			delete: function(category, sub){
				categoryService.preventDefault('on');
				if(confirm('Are you sure you want to remove: "'+sub.title+'" from: "'+category.title+'"?')){
					if(category && category.objectId && sub.title){
						for(var i=0; i<category.children.length; i++){
							if(category.children[i].title==sub.title){
								category.children.splice(i,1)
							}
						}
						$http.put(config.parseRoot+'classes/category/'+category.objectId, category).success(function(data){
							categoryService.parseList();
						}).error(function(data){
							console.log('Error: ',data)
						});
					}
				}
				$timeout(function(){
					categoryService.preventDefault('off');
				}, 1000);
			}
		}
	}

	$rootScope.$on('$locationChangeStart', function(e) {
		categoryService.preventDefault(e);
	});

	it.categoryService = categoryService;
	return categoryService;
});


app.factory('productService', function ($rootScope, $http, config) {
	var productService = {
		parseList:function(){
			$http.get(config.parseRoot+'classes/product').success(function(data){
				$rootScope.data.products = data.results;
			}).error(function(data){
				console.log('Error: ',data)
			});
		},
		add:function(){
			$('#productAddModal').modal('show');
		},
		edit:function(product){
			$rootScope.temp.product = product;
			$('#productAddModal').modal('show');
		},
		save:function(){
			var product = $rootScope.temp.product;
			if(!product.objectId)	// If it is a new product
				$http.post(config.parseRoot+'classes/product', angular.fromJson(angular.toJson(product))).success(function(data){
					productService.parseList();
				}).error(function(data){
					console.log('Error: ',data)
				});
			else	// If it is an edit of an existing product
				$http.put(config.parseRoot+'classes/product/'+product.objectId, angular.fromJson(angular.toJson(product))).success(function(data){
					productService.parseList();
				}).error(function(data){
					console.log('Error: ',data)
				});
			$rootScope.temp.product = {};
			$('#productAddModal').modal('hide');
		},
		delete:function(product){
			if(confirm('Are you sure you want to delete: '+product.name+'?'))
				$http.delete(config.parseRoot+'classes/product/'+product.objectId).success(function(data){
					productService.parseList();
				}).error(function(data){
					console.log('Error: ',data)
				});
		},
		list:function(category){
			var returnArray = [];
			if($rootScope.data && $rootScope.data.products)
				for(var i=0; i<$rootScope.data.products.length; i++)
					if($rootScope.data.products[i].categories)
						if($rootScope.data.products[i].categories.indexOf(category) != -1)
							returnArray.push($rootScope.data.products[i])
			return returnArray;
		},
		get:function(id){
			if($rootScope.data.products)
				for(var i=0; i<$rootScope.data.products.length; i++)
					if($rootScope.data.products[i].objectId == id)
						return $rootScope.data.products[i];
		},
		getList:function(list){
			if(list){
				var arr = [];
				for(var i=0; i<list.length; i++)
					arr.push(productService.get(list[i]))
				return arr;
			}
		}
	}

	it.productService = productService;
	return productService;
});


app.factory('fileService', function ($http, config) {
	var fileService = {
		upload:function(details,b64,successCallback,errorCallback){
			var file = new Parse.File(details.name, { base64: b64});
			file.save().then(function(data) {
				if(successCallback)
					successCallback(data);
			}, function(error) {
				if(errorCallback)
					errorCallback(error)
			});
		}
	}

	it.fileService = fileService;
	return fileService;
});


app.factory('educationService', function ($rootScope, $http, config) {
	var educationService = {
		article:{
			add:function(){
				$('#articleAddModal').modal('show');
			}
		}
	}

	it.educationService = educationService;
	return educationService;
});


app.factory('articleService', function ($rootScope, $http, config, fileService) {
	var articleService = {
		parseList:function(){
			$http.get(config.parseRoot+'classes/article').success(function(data){
				$rootScope.data.articles = data.results;
			}).error(function(data){
				console.log('Error: ',data)
			});
		},
		// add:function(){
		// 	$('#articleAddModal').modal('show');
		// },
		// edit:function(article){
		// 	$rootScope.temp.article = article;
		// 	$('#articleAddModal').modal('show');
		// },
		setPicture: function(details,src){
			if(!$rootScope.temp.article)
				$rootScope.temp.article = {};
			$rootScope.$apply(function(){
				$rootScope.temp.article.picture = {
					temp: true,
					status: 'uploading',
					class: 'grayscale',
					name: 'Image Uploading...',
					src: src
				};
			})

			if($rootScope.user){
				console.log('Uploading picture')
				fileService.upload(details,src,function(data){
					console.log('Picture Uploaded')
					$rootScope.$apply(function(){
						$rootScope.temp.article.picture = {
							name: data.name(),
							src: data.url()
						}
					})
				});
			}else{
				$rootScope.temp.article.picture.name = "You must sign in before you can upload media.";
			}
		},
		save:function(){
			var article = $rootScope.temp.article;
			if(!article.objectId)	// If it is a new article
				$http.post(config.parseRoot+'classes/article', angular.fromJson(angular.toJson(article))).success(function(data){
					articleService.parseList();
				}).error(function(data){
					console.log('Error: ',data)
				});
			else	// If it is an edit of an existing article
				$http.put(config.parseRoot+'classes/article/'+article.objectId, angular.fromJson(angular.toJson(article))).success(function(data){
					articleService.parseList();
				}).error(function(data){
					console.log('Error: ',data)
				});
			$rootScope.temp.article = {};
			$('#articleAddModal').modal('hide');
		},
		delete:function(article){
			if(confirm('Are you sure you want to delete: '+article.name+'?'))
				$http.delete(config.parseRoot+'classes/article/'+article.objectId).success(function(data){
					articleService.parseList();
				}).error(function(data){
					console.log('Error: ',data)
				});
		},
		list:function(category){
			var returnArray = [];
			if($rootScope.data && $rootScope.data.articles)
				for(var i=0; i<$rootScope.data.articles.length; i++)
					if($rootScope.data.articles[i].categories)
						if($rootScope.data.articles[i].categories.indexOf(category) != -1)
							returnArray.push($rootScope.data.articles[i])
			return returnArray;
		},
		get:function(id){
			if($rootScope.data.articles)
				for(var i=0; i<$rootScope.data.articles.length; i++)
					if($rootScope.data.articles[i].objectId == id)
						return $rootScope.data.articles[i];
		},
		getList:function(list){
			if(list){
				var arr = [];
				for(var i=0; i<list.length; i++)
					arr.push(articleService.get(list[i]))
				return arr;
			}
		}
	}

	it.articleService = articleService;
	return articleService;
});
