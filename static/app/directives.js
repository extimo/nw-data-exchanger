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
					$scope.verifying = true;
					var f = function (success) {
						$scope.verifying = false;
						$scope.verified = !!success;
						if (success) {
							$scope.dbTypeConfigs[$scope.bindInfo.type].connRequires.forEach(function (r) {
								if (r.store) {
									$http.post('/api/save', {
										type: $scope.bindInfo.type,
										key: r.id,
										value: $scope.bindInfo[r.id]
									});
								}
							});

							$timeout(function () {
								$state.go($scope.nextState);
								$scope.verified = undefined;
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
				src = src.split(',');
				$e.parent().after("<i class='fa fa-spin fa-cog'></i>");
				$.when.apply($, src.map(function (url) {
					return $.getJSON(url);
				})).done(function () {
					var data = src.length == 1 ? arguments[0] : Array.prototype.slice.call(arguments).reduce(function (arr, d) {
						return arr.concat(d[0].filter(function (v) {
							return arr.indexOf(v) < 0;
						}) || []);
					}, []);
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
				}).always(function () {
					$e.parent().next("i").remove();
				});
			}
		};
	})
	.directive("tableEnumerator", function () {
		return {
			restrict: 'E',
			scope: {
				bindTitle: '@',
				bindCfg: '=',
				bindAlign: '@'
			},
			controller: function ($scope, $http) {
				$scope.bindCfg.selectedTable = "";
				$scope.columns = {};

				$http.post('/api/tables', { connInfo: $scope.bindCfg.connInfo }).success(function (data) {
					$scope.tables = data;
				});

				$scope.selectTable = function (table) {
					$scope.bindCfg.tables[table] = $scope.bindCfg.tables[table] || { cols: {} };
					$scope.bindCfg.selectedTable = table;
					$scope.$parent.svg.join();
				};

				$scope.clearSelection = function () {
					if (Object.keys($scope.bindCfg.tables[$scope.bindCfg.selectedTable].cols).length === 0) {
						delete $scope.bindCfg.tables[$scope.bindCfg.selectedTable];
					}
					$scope.bindCfg.selectedTable = null;
					$scope.$parent.svg.leave();
				};

				$scope.unlink = function (table, column) {
					$scope.$emit('unlink', $scope.bindCfg.from, table, column);
				};

				$scope.$on('configChanged', function () {
					$scope.bindCfg = $scope.bindCfg;
				});
			},
			templateUrl: '../directives/table-enumerator.html'
		};
	})
	.directive("columnEnumerator", function () {
		return {
			restrict: 'E',
			scope: false,
			controller: function ($scope, $http) {
				$scope.$watch('bindCfg.selectedTable', function (table) {
					if ($scope.columns[table]) return;
					$http.post('/api/columns', { connInfo: $scope.bindCfg.connInfo, table: table }).success(function (data) {
						$scope.columns[table] = data;
					});
				});
			},
			templateUrl: '../directives/column-enumerator.html',
			replace: true
		};
	})
	.directive("columnLinker", function () {
		return {
			restrict: 'E',
			scope: {
				type: '@',
				index: '@',
				bindColumn: '@',
				onDrag: '&'
			},
			link: function (scope, elem, attr) {
				var $e = $(elem);
				var column = scope.$eval(scope.bindColumn);
				var linkParam = {
					table: scope.$parent.bindCfg.selectedTable,
					column: column[0],
					type: column[1],
					size: column[2],
					commonType: column[3],
					index: scope.index,
					of: scope.$parent.bindCfg.from
				};

				$e.addClass("column-linker");
				$e.data('linking', function (col) {
					scope.$emit('link', col, linkParam);
				});

				$e.draggable({
					helper: function () {
						return $("<i></i>");
					},
					opacity: 0.01,
					revert: true,
					revertDuration: 0,
					scope: scope.$parent.bindCfg.from + '-column-' + linkParam.commonType,
					stack: '.column-linker',
					zIndex: 100,
					cursor: "crosshair",
					drag: function (event, ui) {
						scope.onDrag(ui.position);
					}
				});

				$e.parent().parent().droppable({
					accept: '.column-linker',
					scope: scope.$parent.bindCfg.to + '-column-' + linkParam.commonType,
					tolerance: 'pointer',
					activate: function () {
						$e.removeClass('fa-exchange');
						$e.addClass('fa-crosshairs fa-spin');
					},
					deactivate: function () {
						$e.addClass('fa-exchange');
						$e.removeClass('fa-crosshairs fa-spin');
					},
					over: function () {
						$e.parent().parent().addClass('bg-success');
					},
					out: function () {
						$e.parent().parent().removeClass('bg-success');
					},
					drop: function (event, ui) {
						$e.addClass('fa-exchange');
						$e.removeClass('fa-crosshairs fa-spin');
						$e.parent().parent().removeClass('bg-success');
						$e.parent().parent().droppable("destroy");
						ui.draggable.data('linking')(linkParam);
					}
				});
			},
			template: '<i class="fa fa-exchange fa-fw"></i>',
			replace: true
		};
	})
	.directive("onresize", function () {
		return {
			restrict: 'A',
			scope: {
				onresize: '&'
			},
			link: function (scope, elem, attr) {
				var $e = $(elem);
				$e.resize(function () {
					scope.onresize({
						width: $e.width(),
						height: $e.height()
					});
				});
			}
		};
	});