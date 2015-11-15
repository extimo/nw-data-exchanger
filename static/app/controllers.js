angular.module('NWDEControllers', [])
	.controller('BaseController', ['$scope', function ($scope) {
		$scope.fullWidth = $(window).width() < 1366;
		$scope.toggleWidth = function () {
			$scope.fullWidth = !$scope.fullWidth;
		};
	}])
	.controller('NewConfigController', ['$scope', '$state', function ($scope, $state) {
		$scope.cfg = {
			src: { connInfo: {}, tables: {}, from: 'src', to: 'dst' },
			dst: { connInfo: {}, tables: {}, from: 'dst', to: 'src' }
		};

		$scope.$on('$stateChangeSuccess', function () {
			$scope.progress = $state.current.progress;
		});
	}])
	.controller('NewConfigMainController', ['$scope', function ($scope) {
		$scope.svg = {
			showCount: 0,
			height: 0,
			srcHeight: 0,
			dstHeight: 0,
			lines: {},
			gen: function () {
				for (var column in $scope.cfg.src.tables[$scope.cfg.src.selectedTable].cols) {
					var col = $scope.cfg.src.tables[$scope.cfg.src.selectedTable].cols[column];
					var linked = col.linkedTo;

					if (linked.table == $scope.cfg.dst.selectedTable) {
						$scope.svg.lines[['src' + $scope.cfg.src.selectedTable + column, 'dst' + linked.table + linked.column].sort().join(':')] = {
							start: col.index,
							end: $scope.cfg.dst.tables[linked.table].cols[linked.column].index
						};
					}
				}
			},
			join: function () {
				$scope.svg.showCount++;
				if ($scope.svg.showCount >= 2) $scope.svg.gen();
			},
			leave: function () {
				$scope.svg.showCount--;
				$scope.svg.lines = {};
			}
		};

		$scope.onResize = function (width, height, who) {
			$scope.svg[who + 'Height'] = height;
			$scope.svg.height = Math.max($scope.svg.srcHeight, $scope.svg.dstHeight);
			$scope.$apply();
		};

		$scope.autoLink = function () {
			if ($scope.svg.showCount < 2) return;

			for (var column in $scope.srcTables) {

			}
		};

		$scope.$on('link', function (e, col1, col2) {
			$scope.cfg[col1.of].tables[col1.table].cols[col1.column] = $.extend({
				linkedTo: {
					table: col2.table,
					column: col2.column
				}
			}, col1);
			$scope.cfg[col2.of].tables[col2.table].cols[col2.column] = $.extend({
				linkedTo: {
					table: col1.table,
					column: col1.column
				}
			}, col2);
			$scope.svg.lines[[col1.of + col1.table + col1.column, col2.of + col2.table + col2.column].sort().join(':')] = {
				start: col1.of == 'src' ? col1.index : col2.index,
				end: col2.of == 'src' ? col1.index : col2.index
			};

			e.targetScope.$apply();
			e.stopPropagation();
		});

		$scope.$on('unlink', function (e, who, table, column) {
			var linked = $scope.cfg[who].tables[table].cols[column].linkedTo;
			delete $scope.cfg[who].tables[table].cols[column];
			delete $scope.cfg[$scope.cfg[who].to].tables[linked.table].cols[linked.column];
			delete $scope.svg.lines[[who + table + column, $scope.cfg[who].to + linked.table + linked.column].sort().join(':')];

			e.stopPropagation();
			$scope.$broadcast('configChanged');
		});
	}]);