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
	.state('newConfig.srcType', {
		url: "/srcType",
		templateUrl: "partials/newConfig.srcType.html",
		onEnter: function(newConfigProgress){
			newConfigProgress.set(0);
		}
	})
	.state('newConfig.srcInfos', {
		url: "/srcInfos?:type",
		templateUrl: function(params){
			return "partials/newConfig.srcInfos." + params.type + ".html"
		},
		onEnter: function(newConfigProgress){	
			newConfigProgress.set(10);
		}
	});
}]);