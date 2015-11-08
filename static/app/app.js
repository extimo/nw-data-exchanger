/* global ElasticProgress */
/* global io */
angular.module('NWDataExchange', ['ui.router', 'NWDEControllers'])
.run(function($rootScope, $state, $timeout, $location, newConfigProgress){
	$rootScope.commonDialog = {};
	
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		if(toState.name == 'newConfig'){
			$timeout(function(){
				$state.go('newConfig.srcType');
			});
		}
		else if(fromState.name.indexOf('newConfig') >= 0 && toState.name.indexOf('newConfig') < 0){
			event.preventDefault();
			$rootScope.openDialog({
				content: '当前配置还未完成，确定离开吗？',
				hasCancel:true,
				hasConfirm: true,
				confirmAction: function(){
					$state.go(toState.name, {}, {
						notify: false,
						reload: true
					});
					$timeout(function(){
						$state.reload();
					});
					newConfigProgress.end();
				}
			});
		}
	});
	
	$rootScope.openDialog = function(opt){
		$rootScope.commonDialog.title = opt.title || "提示";
		$rootScope.commonDialog.content = opt.content || "";
		$rootScope.commonDialog.hasCancel = opt.hasCancel || !!opt.cancelText;
		$rootScope.commonDialog.hasConfirm = opt.hasConfirm || !!opt.confirmText;
		$rootScope.commonDialog.cancelText = opt.cancelText || "取消";
		$rootScope.commonDialog.confirmText = opt.confirmText || "确定";
		$rootScope.commonDialog.cancelAction = opt.cancelAction || function(){};
		$rootScope.commonDialog.confirmAction = opt.confirmAction || function(){};
		$("#commonDialog").modal('show');
	}
})
.factory('$socket', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
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
	}
}])
.config(['$locationProvider', function ($locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('!');
}])
.service('newConfigProgress', function($timeout){
	var p;
	return {
		start: function(){
			if(p) return this;
			p = $('#new-cfg-progress');
			$timeout(function(){
				p.ElasticProgress({
					labelHeight: 20,
					jumpHeight: 10,
					barStretch: 0,
					width: p.parent().width(),
					colorFg: "#0099FF",
					colorBg: "#eee"
				});
				p.ElasticProgress('open');
			});
			return this;
		},
		set: function (val) {
			if(!p) return this;
			if(p.ElasticProgress('getValue') * 100 > val){
				this.end().start();
			}
			p.ElasticProgress('setValue', val / 100);
			return this;
		},
		end: function(){
			if(!p) return this;
			p.empty();
			p = null;
			return this;
		},
		cancel: function(){
			if(!p) return this;
			p.ElasticProgress('cancel');
			return this;
		},
		fail: function(){
			if(!p) return this;
			p.ElasticProgress('fail');
			return this;
		}
	}
});