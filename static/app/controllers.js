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
	$scope.verify = function(infos){
		$scope.verified = false;
		$scope.verifying = true;
		var f = function(success){
			$scope.verifyResult = success == 'true';
			$scope.verifying = false;
			$scope.verified = true;
		}
		$http.post('/api/testConnection', infos).success(f).error(f);
	}
	$scope.unverify = function(){
		$scope.verified = false;
		$scope.verifying = false;
		$scope.verifyResult = false;
	}
}])