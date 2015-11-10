/* global ElasticProgress */
/* global io */
angular.module('NWDataExchange', ['ui.router', 'NWDEControllers'])
	.run(function ($rootScope, $state, $timeout, commonDialog) {
		$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
			if (toState.name == 'newConfig') {
				$timeout(function () {
					$state.go('newConfig.srcConnInfo');
				});
			}
			else if (fromState.name.indexOf('newConfig') >= 0 && toState.name.indexOf('newConfig') < 0) {
				event.preventDefault();
				commonDialog.open({
					content: '当前配置还未完成，确定离开吗？',
					hasCancel: true,
					hasConfirm: true,
					confirmAction: function () {
						$state.go(toState.name, {}, {
							notify: false,
							reload: true
						});
						$timeout(function () {
							$state.reload();
						});
					}
				});
			}
		});
	})
	.factory('socket', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
		var socket = io.connect('/');
		return {
			on: function (eventName, callback) {
				socket.on(eventName, function () {
					var args = arguments;
					$timeout(function () {
						callback.apply(socket, args);
					});
				});
			},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$timeout(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				});
			}
		};
	}])
	.factory('commonDialog', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
		$rootScope.commonDialog = {};

		return {
			open: function (opt) {
				$rootScope.commonDialog.title = opt.title || "提示";
				$rootScope.commonDialog.content = opt.content || "";
				$rootScope.commonDialog.hasCancel = opt.hasCancel || !!opt.cancelText;
				$rootScope.commonDialog.hasConfirm = opt.hasConfirm || !!opt.confirmText;
				$rootScope.commonDialog.cancelText = opt.cancelText || "取消";
				$rootScope.commonDialog.confirmText = opt.confirmText || "确定";
				$rootScope.commonDialog.cancelAction = opt.cancelAction || function () { };
				$rootScope.commonDialog.confirmAction = opt.confirmAction || function () { };
				$("#commonDialog").modal('show');
			},
			close: function () {
				$("#commonDialog").modal('hide');
			}
		};
	}])
	.config(['$locationProvider', function ($locationProvider) {
		$locationProvider.html5Mode(true).hashPrefix('!');
	}]);