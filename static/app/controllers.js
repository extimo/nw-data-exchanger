angular.module('NWDEControllers', [])
	.controller('BaseController', ['$scope', function ($scope) {
		$scope.fullWidth = false;
		$scope.toggleWidth = function () {
			$scope.fullWidth = !$scope.fullWidth;
		};
	}])
	.controller('NewConfigController', ['$scope', '$http', 'newConfigProgress', function ($scope, $http, newConfigProgress) {
		$scope.cfg = {
			srcConnInfo: {},
			dstConnInfo: {},
			srcConfig: { tables: [] },
			dstConfig: { tables: [] }
		};
		$scope.startProgress = function () {
			newConfigProgress.start();
		};
	}]);