var ctrls = angular.module('NWDEControllers', []);

ctrls.controller('BaseController', ['$scope', function ($scope) {
	$scope.fullWidth = false;
	$scope.toggleWidth = function () {
		$scope.fullWidth = !$scope.fullWidth;
	}
}])
.controller('NewConfigController', ['$scope', '$http', 'newConfigProgress', function ($scope, $http, newConfigProgress) {
	$scope.cfg = {
		srcInfos: {},
		dstInfos: {}
	};
	$scope.startProgress = function(){
		newConfigProgress.start();
	};
}])
.controller('NewConfigMainController', ['$scope', '$http', function ($scope, $http) {
	$http.post('/api/tables', $scope.srcInfos).success(function(data){
		
	}).error(function(){
		$scope.srcTables = null;
	});
}])