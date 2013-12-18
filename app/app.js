var it = {};

var app = angular.module('TheHerbBasket', ['firebase','pascalprecht.translate'])
.config(function($routeProvider,$httpProvider,$translateProvider) {
	$routeProvider
	.when('/:view', {
		templateUrl: 'views/main.html'
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