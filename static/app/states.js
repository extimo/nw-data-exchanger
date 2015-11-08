/* global io */
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
	.state('newConfig.srcInfos', {
		url: "/srcInfos",
		templateUrl: "partials/newConfig.srcInfos.html",
		onEnter: function(newConfigProgress){
			newConfigProgress.set(0);
		}
	})
	.state('newConfig.dstInfos', {
		url: "/dstInfos",
		templateUrl: "partials/newConfig.dstInfos.html",
		onEnter: function(newConfigProgress){
			newConfigProgress.set(25);
		}
	})
	.state('newConfig.main', {
		url: "/main",
		templateUrl: "partials/newConfig.main.html",
		onEnter: function(newConfigProgress){
			newConfigProgress.set(50);
		},
		controller: "NewConfigMainController"
	});
}]);