angular.module('NWDEControllers', [])
	.controller('BaseController', ['$scope', function ($scope) {
		$scope.fullWidth = false;
		$scope.toggleWidth = function () {
			$scope.fullWidth = !$scope.fullWidth;
		};
	}])
	.controller('NewConfigController', ['$scope', '$http', '$state', function ($scope, $http, $state) {
		$scope.cfg = {
			srcConnInfo: {},
			dstConnInfo: {},
			srcConfig: { tables: [] },
			dstConfig: { tables: [] }
		};
		
		$scope.$on('$stateChangeSuccess', function () {
			$scope.progress = $state.current.progress;
		});
	}]);