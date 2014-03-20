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
				$rootScope.data.store.categories = data.results;
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
			if(!$rootScope.data.store.categories)
				$rootScope.data.store.categories = [];
			var category = $rootScope.temp.category;
			delete category.createdAt;
			delete category.updatedAt;

			if(!category.objectId){
				category.sequence = $rootScope.data.store.categories.length;
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
			if($rootScope.data.store.categories)
				for(var i=0; i<$rootScope.data.store.categories.length; i++)
					if($rootScope.data.store.categories[i].title == id)
						return $rootScope.data.store.categories[i];
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
				$rootScope.data.store.products = data.results;
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
			if($rootScope.data && $rootScope.data.store.products)
				for(var i=0; i<$rootScope.data.store.products.length; i++)
					if($rootScope.data.store.products[i].categories)
						if($rootScope.data.store.products[i].categories.indexOf(category) != -1)
							returnArray.push($rootScope.data.store.products[i])
			return returnArray;
		},
		get:function(id){
			if($rootScope.data.store.products)
				for(var i=0; i<$rootScope.data.store.products.length; i++)
					if($rootScope.data.store.products[i].objectId == id)
						return $rootScope.data.store.products[i];
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















app.factory('dataService', function ($rootScope, $http, $q, config, Firebase) {
	//Set local dataStore obj if it doesn't exist
	if(!localStorage.getItem('RQdataStore'))
		localStorage.setItem('RQdataStore', angular.toJson({
			resource: {},
			resourceList: [],
			notLocal:[], 
			wip: {}
		}))

	//Load local dataStore
	var dataStore = angular.fromJson(localStorage.getItem('RQdataStore'));



	var DS = {
		data: function(){
			return dataStore;
		},
		resourceList: function(){
			return dataStore.resourceList;
		},
		localSave:function(){
			var tempData = angular.fromJson(angular.toJson(dataStore))
				for(var i=0; i<tempData.notLocal.length; i++)
					delete tempData.resource[tempData.notLocal[i]]
			localStorage.setItem('RQdataStore', angular.toJson(tempData))
		},
		wip: {
			add: function(identifier, object){
				if(object.objectId){
					if(!dataStore.wip[identifier])
						dataStore.wip[identifier] = {};
					dataStore.wip[identifier][object.objectId] = object;
					DS.localSave();
				}
			},
			remove: function(identifier, objectId){
				if(typeof(object)=='object')
					objectId = objectId.objectId

				if(dataStore.wip[identifier])
					delete dataStore.wip[identifier][objectId];
			},
			list: function(){
				return dataStore.wip;
			},
			isInEdit: function(identifier, object){
				if(dataStore.wip[identifier])
					return !!dataStore.wip[identifier][object.objectId]
			},
			keepResource: function(identifier, resource){
				if(dataStore.wip[identifier])
					for(var i=0; i<resource.length; i++)
						if(dataStore.wip[identifier][resource[i].objectId])
							resource[i] = dataStore.wip[identifier][resource[i].objectId]
				return resource;
			}
		},
		resource: function(className, identifier, isLive, isLocal, query){
			var resource = this;
			resource.listenId = 'DS-'+identifier;
			resource.config = {
				className: className,
				identifier: identifier,
				isLive: isLive,
				isLocal: isLocal,
				query: query,
			}
			if(isLive){
				resource.config.liveRef = new Firebase(config.fireRoot+identifier)
				resource.config.liveRef.on('value', function(dataSnapshot) {
					// alert(dataSnapshot.val())
					if(dataStore.resource[identifier])
						var lastUpdate = dataStore.resource[identifier].liveSync;
					if(dataSnapshot.val() != lastUpdate){
						resource.loadData(dataSnapshot.val())
					}else{
						$rootScope.$broadcast(resource.listenId, dataStore.resource[identifier]);
					}
				});
			}
			if(!isLocal){
				if(dataStore.notLocal && dataStore.notLocal.indexOf(resource.config.identifier) == -1)
					dataStore.notLocal.push(resource.config.identifier)
			}
			if(dataStore.resourceList.indexOf(identifier) == -1)
				dataStore.resourceList.push(identifier)

 			resource.setQuery = function(query){
				resource.config.query = query;
			}
			resource.loadData = function(lastUpdate){
				var deferred 	= $q.defer();
				var className 	= resource.config.className
				var identifier 	= resource.config.identifier
				var query = '';
				if(resource.config.query)
					query = '?'+resource.config.query

				$http.get(config.parseRoot+'classes/'+className+query).success(function(data){
					dataStore.resource[identifier] = {
						identifier: identifier,
						results: DS.wip.keepResource(identifier, data.results),
						liveSync: lastUpdate
					}

					DS.localSave();
					$rootScope.$broadcast(resource.listenId, dataStore.resource[identifier]);
					deferred.resolve(dataStore.resource[identifier]);
				}).error(function(data){
					deferred.reject(data);
				});
				return deferred.promise;
			}
			function fireBroadcast(timestamp){
				if(resource.config.liveRef)
					resource.config.liveRef.set(timestamp)
				else
					resource.loadData();
			}
			this.item = {
				list: function(){
					var deferred = $q.defer();
					var className 	= resource.config.className
					var identifier 	= resource.config.identifier
					if(dataStore.resource[identifier]){
						deferred.resolve(dataStore.resource[identifier]);
						if(!resource.config.isLive)
							resource.loadData()
					}else{
						resource.loadData().then(function(data){
							deferred.resolve(data);
						})
					}
					return deferred.promise;
				},
				get: function(objectId){
					var deferred = $q.defer();
					var className 	= resource.config.className
					var identifier 	= resource.config.identifier

					var resourceList = dataStore.resource[identifier].results;
					var requestedResource = false;
					for(var i=0; i<resourceList.length; i++){
						if(resourceList[i].objectId == objectId)
							requestedResource = resourceList[i]
					}
					if(requestedResource)
						deferred.resolve(requestedResource);
					else
						$http.get(config.parseRoot+'classes/'+className+'/'+objectId).success(function(data){
							deferred.resolve(data);
						}).error(function(data){
							deferred.reject(data);
						});
					return deferred.promise;
				},
				save: function(object){
					if(!object)
						object = {};
					if(object.objectId)
						return this.update(object)
					else
						return this.add(object)
				},
				add: function(object){
					var deferred = $q.defer();
					var className = resource.config.className;
					var identifier = resource.config.identifier;
					var objectId = object.objectId;

					$http.post(config.parseRoot+'classes/'+className, object).success(function(data){
						DS.wip.remove(identifier, objectId)
						fireBroadcast(data.createdAt)
						deferred.resolve(data);
					}).error(function(error, data){
						resource.loadData();
						deferred.reject(data);
					});
					return deferred.promise;
				},
				update: function(object){
					var deferred = $q.defer();
					var className = resource.config.className;
					var identifier = resource.config.identifier;
					var objectId = object.objectId;

					delete object.objectId;
					delete object.createdAt;
					delete object.updatedAt;

					$http.put(config.parseRoot+'classes/'+className+'/'+objectId, object).success(function(data){
						DS.wip.remove(identifier, objectId)
						fireBroadcast(data.updatedAt)
						deferred.resolve(data);
					}).error(function(error, data){
						resource.loadData();
						deferred.reject(data);
					});
					return deferred.promise;
				},
				remove: function(object){
					var deferred = $q.defer();
					var className = resource.config.className
					var identifier = resource.config.identifier;
					var objectId = object.objectId;

					$http.delete(config.parseRoot+'classes/'+className+'/'+object.objectId).success(function(data){
						var deletedAt = new Date();
						DS.wip.remove(identifier, objectId)
						fireBroadcast(deletedAt.toISOString())
						deferred.resolve(data);
					}).error(function(error, data){
						resource.loadData();
						deferred.reject(data);
					});
					return deferred.promise;
				}
			}
			this.remove = function(){
				var identifier = resource.config.identifier;

				var posInNotLocal = dataStore.notLocal.indexOf[identifier]
				if(posInNotLocal != -1)
					dataStore.notLocal.splice(posInNotLocal, 1)
				delete dataStore.resource[identifier]
				var posInResourceList = dataStore.resourceList.indexOf[identifier]
				if(posInResourceList != -1)
					dataStore.notLocal.splice(posInResourceList, 1)
				delete dataStore.wip[identifier]

				DS.localSave();
			}
		},
		parse:{
			pointer:function(className, objectId){
				return {
					__type: 	'Pointer',
					className: 	className,
					objectId: 	objectId
				}
			},
			acl: function(read, write){
				var acl = {};
					acl[$rootScope.user.objectId] = {
						read: true,
						write: true
					}
					if(read && write)
						acl['*'] = {
							read: read,
							write: write
						}
					else if(read)
						acl['*'] = {
							read: read
						}
				return acl;
			}
		}
	}
	it.DS = DS;
	return DS;
});









