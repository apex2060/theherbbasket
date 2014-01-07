var it = {};

var app = angular.module('TheHerbBasket', ['firebase','pascalprecht.translate'])
.config(function($routeProvider,$translateProvider) {
	$routeProvider
	.when('/:view', {
		templateUrl: 'views/main.html',
		controller: 'MainCtrl'
	})
	.when('/:view/:other', {
		templateUrl: 'views/store.html',
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