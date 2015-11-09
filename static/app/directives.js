angular.module('NWDataExchange')
.directive("dbSelector", function () {
	return {
		restrict: 'E',
		scope: {
			bindData: '='
		},
		controller: function($scope){
			$scope.dbs = [
				{id: 'orc', name: 'Oracle'},
				{id: 'sql', name: 'Sql Server'}
			];
			$scope.setType = function(type){
				$scope.bindData.type = type;
			};
		},
		templateUrl: '../directives/db-selector.html'
	}
})
.directive("dbConnector", function () {
	return {
		restrict: 'E',
		scope: {
			bindInfo: '=',
			nextState: '@'
		},
		controller: function ($scope, $http, $state, $timeout) {
			$scope.verify = function () {
				$scope.verified = false;
				$scope.verifying = true;
				var f = function (success) {
					$scope.verifyResult = success;
					$scope.verifying = false;
					$scope.verified = true;
				}
				$http.post('/api/testConnection', $scope.bindInfo).success(f).error(f);
			}
			$scope.unverify = function () {
				$scope.verified = false;
				$scope.verifying = false;
				$scope.verifyResult = false;
			}
			$scope.gotoNextState = function () {
				$state.go($scope.nextState);
			}
			$scope.loaded = function () {
				$("[data-autocomplete-source]").each(function(i, e){
					var $e = $(e);
					$e.parent().after("<i class='fa fa-spin fa-cog'></i>");
					$.getJSON($e.data('autocomplete-source')).done(function (data){
						$e.parent().next("i").remove();
						$e.autocomplete({
							minLength: 0,
							delay: 0,
							source: data,
							select: function(event, ui) {
								if($e.attr('ng-model')){
									$timeout(function(){
										eval('$scope.' + $e.attr('ng-model') + '="' + ui.item.value + '"');
									});
									$scope.unverify();
								}
							}
						});
						$e.click(function(){
							$e.autocomplete("search", "");
						})
					});
				});
			}
		},
		link: function (scope, elem, attr) {
			scope.getContentUrl = function () {
				return '../directives/' + attr.type + '-connector.html';
			}
		},
		template: '<div ng-include="getContentUrl()" onload="loaded()"></div>',
		replace: true
	}
})