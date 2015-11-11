angular.module('NWDEControllers', [])
	.controller('BaseController', ['$scope', function ($scope) {
		$scope.fullWidth = false;
		$scope.toggleWidth = function () {
			$scope.fullWidth = !$scope.fullWidth;
		};
	}])
	.controller('NewConfigController', ['$scope', '$http', '$state', function ($scope, $http, $state) {
		$scope.cfg = {
			src: { connInfo: {}, tables: [], from: 'src', to: 'dst' },
			dst: { connInfo: {}, tables: [], from: 'dst', to: 'src' }
		};

		$scope.$on('$stateChangeSuccess', function () {
			$scope.progress = $state.current.progress;
		});


		$scope.$on('link', function (e, col1, col2) {
			$scope.cfg[col1.of].tables[col1.table].cols[col1.column] = {
				type: col1.type,
				size: col1.size,
				linkedTo: {
					table: col2.table,
					column: col2.column
				}
			};
			$scope.cfg[col2.of].tables[col2.table].cols[col2.column] = {
				type: col2.type,
				size: col2.size,
				linkedTo: {
					table: col1.table,
					column: col1.column
				}
			};
		});
	}]);