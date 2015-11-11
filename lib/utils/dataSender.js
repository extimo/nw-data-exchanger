var db = require('../db/operator');

module.exports = function () {
	var args = require('./argEnumerator')(arguments);

	if (typeof (arguments[0]) == "string") {
		var action = args.next('string');
		var transformErr = args.next('function') || function () { return null; };
		var transformData = args.next('function') || function (data) { return data; };
		var params = [], p;
		while ((p = args.next('string')) !== null) {
			params.push(p);
		}
		return (function (action, params) {
			return function (req, res) {
				var op = db(req.body.connInfo, function (err) {
					res.send(transformErr(err));
				});
				op[action].apply(op, params.map(function (p) {
					return req.body[p];
				}).concat(function (data) {
					res.send(transformData(data));
				}));
			};
		})(action, params);
	}

	var res = args.next();
	var otherwise = args.next();
	return (function (res, otherwise) {
		return function (data) {
			res.send(data || otherwise);
		};
	})(res, otherwise);
};