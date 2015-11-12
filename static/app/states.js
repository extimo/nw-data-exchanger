angular.module('NWDataExchange')
.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise("/dashboard");
	
	$stateProvider.state('dashboard', {
		url: "/dashboard",
		templateUrl: "partials/dashboard.html"
	})
	.state('newConfig', {
		url: "/newConfig",
		templateUrl: "partials/newConfig.html",
		controller: "NewConfigController"
	})
	.state('newConfig.srcConnInfo', {
		url: "/srcConnInfo",
		templateUrl: "partials/newConfig.srcConnInfo.html",
		progress: 0
	})
	.state('newConfig.dstConnInfo', {
		url: "/dstConnInfo",
		templateUrl: "partials/newConfig.dstConnInfo.html",
		progress: 25
	})
	.state('newConfig.main', {
		url: "/main",
		templateUrl: "partials/newConfig.main.html",
		progress: 50,
		controller: 'NewConfigMainController'
	});
}]);