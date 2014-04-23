//DEVELOPMENT CONFIG
app.factory('config', function ($rootScope, $http) {
	var config = {
		fireRoot: 			'https://theherbbasketllc.firebaseio.com/',
		fireRef: 			new Firebase('https://theherbbasketllc.firebaseio.com/'),
		parseRoot: 			'https://api.parse.com/1/',
		parseAppId: 		'uU3IpXVDhypoysMejtaJqQl4zRRmL0TbfIm2sVoi',
		parseJsKey: 		'NSrjgzrcYfmpkKM7HSJHKC7LOQRMDa5U5UsfFlmO',
		parseRestApiKey: 	'JeHP0Z707lwIfvt93wZnQC1cCrwCM0nmyfGp7jhb',
		objectIds: {
			featured_products:'eaOHR4HQpQ'
		}
	};

	Parse.initialize(config.parseAppId, config.parseJsKey);
	 $http.defaults.headers.common['X-Parse-Application-Id'] = config.parseAppId;
	 $http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
	 $http.defaults.headers.common['Content-Type'] = 'application/json';

	it.config = config;
	return config;
});

// //PROD CONFIG
// app.factory('config', function ($rootScope, $http) {
// 	var config = {
// 		fireRoot: 			'https://theherbbasketllc.firebaseio.com/',
// 		fireRef: 			new Firebase('https://theherbbasketllc.firebaseio.com/'),
// 		parseRoot: 			'https://api.parse.com/1/',
// 		parseAppId: 		'LGFKFi6VTypJ0sCtxs5b8JqnXrsI6qiOAFJziQrf',
// 		parseJsKey: 		'VPujhD6rF8D5iasrkK0DbkQur88n2UxqBt3cwQws',
// 		parseRestApiKey: 	'msF8j5ymmFNNYyRuoQbCD69MoBuMWWa1iN3o89Bq',
// 		objectIds: {
// 			featured_products:'eaOHR4HQpQ'
// 		}
// 	};

// 	Parse.initialize(config.parseAppId, config.parseJsKey);
// 	 $http.defaults.headers.common['X-Parse-Application-Id'] = config.parseAppId;
// 	 $http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parseRestApiKey;
// 	 $http.defaults.headers.common['Content-Type'] = 'application/json';

// 	it.config = config;
// 	return config;
// });