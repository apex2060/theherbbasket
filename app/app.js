var it = {};

var app = angular.module('TheHerbBasket', ['firebase','pascalprecht.translate','ngAnimate','ngRoute'])
.config(function($routeProvider,$translateProvider) {
	$routeProvider
		.when('/store/:view', {
			templateUrl: 'views/store.html',
			controller: 'MainCtrl'
		})
		.when('/store/:view/:id', {
			templateUrl: 'views/store.html',
			controller: 'MainCtrl'
		})
		.when('/store/:view/:id/:subId', {
			templateUrl: 'views/store.html',
			controller: 'MainCtrl'
		})
		.when('/store', {
			redirectTo: '/store/main'
		})

		.when('/education/:view', {
			templateUrl: 'views/education.html',
			controller: 'MainCtrl'
		})
		.when('/education/:view/:id', {
			templateUrl: 'views/education.html',
			controller: 'MainCtrl'
		})
		.when('/education', {
			redirectTo: '/education/main'
		})


		.when('/:view', {
			templateUrl: 'views/main.html',
			controller: 'MainCtrl'
		})
		.when('/:view/:other', {
			templateUrl: 'views/unknown.html',
			controller: 'MainCtrl'
		})
		.otherwise({
			redirectTo: '/home'
		});

	$translateProvider.useStaticFilesLoader({
		prefix: 'languages/',
		suffix: '.json'
	});
	$translateProvider.uses('en');
});


angular.element(document).ready(function() {
	angular.bootstrap(document, ['TheHerbBasket']);
});