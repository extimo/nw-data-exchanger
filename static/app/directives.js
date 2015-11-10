angular.module('NWDataExchange')
	.directive("dbSelector", function () {
		return {
			restrict: 'E',
			scope: {
				bindData: '='
			},
			controller: function ($scope, dbTypeConfigs) {
				$scope.dbTypes = Object.keys(dbTypeConfigs);
				$scope.dbTypeConfigs = dbTypeConfigs;
				$scope.setType = function (type) {
					$scope.bindData.type = type;
				};
			},
			templateUrl: '../directives/db-selector.html',
			replace: true
		};
	})
	.directive("dbConnector", function () {
		return {
			restrict: 'E',
			scope: {
				bindInfo: '=',
				nextState: '@'
			},
			controller: function ($scope, $http, $state, $timeout, dbTypeConfigs) {
				$scope.dbTypeConfigs = dbTypeConfigs;
				
				$scope.requireChanged = function () {
					$scope.allFilledIn = $scope.dbTypeConfigs[$scope.bindInfo.type].connRequires.every(function (r) {
						return !!$scope.bindInfo[r.id];
					});
				};
				$scope.verify = function () {
					$scope.verified = false;
					$scope.verifying = true;
					var f = function (success) {
						$scope.verifying = false;
						$scope.verified = !!success;
						if (success) {
							$timeout(function () {
								$state.go($scope.nextState);
							}, 500);
						}
					};
					$http.post('/api/testConnection', { connInfo: $scope.bindInfo }).success(f).error(f);
				};
			},
			templateUrl: '../directives/db-connector.html',
			replace: true
		};
	})
	.directive("autoCompleteSource", function () {
		return {
			restrict: 'A',
			require: "ngModel",
			scope: {
				autoCompleteSource: '@'
			},
			link: function (scope, elem, attr, ngModel) {
				var $e = $(elem), src = scope.autoCompleteSource;
				if (!src || src.length === 0) return;
				$e.parent().after("<i class='fa fa-spin fa-cog'></i>");
				$.getJSON(src).done(function (data) {
					$e.parent().next("i").remove();
					$e.autocomplete({
						minLength: 0,
						delay: 0,
						source: data,
						select: function (event, ui) {
							if ($e.attr('ng-model')) {
								ngModel.$setViewValue(ui.item.value);
							}
						}
					});
					$e.click(function () {
						$e.autocomplete("search", "");
					});
				}).fail(function () {
					$e.parent().next("i").remove();
				});
			}
		};
	})
	.directive("tableEnumerator", function () {
		return {
			restrict: 'E',
			scope: {
				bindConnInfo: '=',
				bindTitle: '@',
				bindCfg: '=',
				bindAlign: '@'
			},
			controller: function ($scope, $http) {
				$scope.selectedTable = "";

				$http.post('/api/tables', { connInfo: $scope.bindConnInfo }).success(function (data) {
					$scope.tables = data;
				});

				$scope.selectTable = function (table) {
					$scope.bindCfg.tables[table] = $scope.bindCfg.tables[table] || {};
					$scope.selectedTable = table;
				};
				
				$scope.clearSelection = function () {
					if (Object.keys($scope.bindCfg.tables[$scope.selectedTable]).length === 0) {
						$scope.bindCfg.tables[$scope.selectedTable] = undefined;
					}
					$scope.selectedTable = null;
				};
			},
			templateUrl: '../directives/table-enumerator.html'
		};
	})
	.directive("columnEnumerator", function () {
		return {
			restrict: 'E',
			scope: false,
			controller: function ($scope, $http) {
				$scope.$watch('selectedTable', function (table, old) {
					if ($scope.columns && table == old) return;
					$http.post('/api/columns', { connInfo: $scope.bindConnInfo, table: table }).success(function (data) {
						$scope.columns = data;
					});
				});
			},
			templateUrl: '../directives/column-enumerator.html',
			replace: true
		};
	});