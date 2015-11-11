module.exports = function (args) {
	return {
		args: Array.prototype.slice.call(args, 0),
		next: function (type) {
			if (!type) return this.args.splice(0, 1)[0];
			for (var i = 0; i < this.args.length; i++) {
				if (typeof (this.args[i]) == type) {
					return this.args.splice(i, 1)[0];
				}
			}
			return null;
		},
		rest: function () {
			return this.args;
		}
	};
};