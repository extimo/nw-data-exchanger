var orclConnection = require('oracledb');
var argEnumerator = require('../utils/argEnumerator');

// test usage:
// var Orcl = require('./lib/db/oracle');
// var db = new Orcl('TJZB_UID', '1', 'DBTJZB', function(err){
// 	console.error(err.message);
// });

// db.execute("select table_name from user_tables", function(re){
// 	console.log(re);
// })

module.exports = orclHelper;

orclHelper._noop = function () { };

orclHelper._conn = function (user, pass, db, fn) {
	orclConnection.getConnection({
		user: user,
		password: pass,
		connectString: db
	}, fn);
}

orclHelper.prototype._execute = function (sql, params, cb) {
	this._executeWithOption(sql, params, {}, cb);
}

orclHelper.prototype._executeWithOption = function (sql, params, options, cb) {
	var that = this;
	this.$(function (conn) {
		conn.execute(sql, params, function (err, result) {
			if (err) {
				that.onerr(err);
				return;
			}
			cb(result);
			conn.release(function(err){
				if(err) that.onerr(err);
			});
		});
	});
}

orclHelper.prototype.$ = function (fn) {
	var that = this;
	orclHelper._conn(this.user, this.pass, this.db, function (err, conn) {
		if (err) {
			that.onerr(err);
			return;
		}
		fn(conn);
	});
}

function orclHelper(user, pass, db, onerr) {
	this.user = user;
	this.pass = pass;
	this.onerr = onerr || orclHelper._noop;
	if (db && db.indexOf("/") == -1) {
		db = "localhost/" + db;
	}
	this.db = db;
}

orclHelper.prototype.executeNonQuery = function (sql) {
	var enumerator = argEnumerator(arguments);
	var params = enumerator.next('object') || {};
	var cb = enumerator.next('function') || orclHelper._noop;
	this._execute(sql, params, function(result){
		cb(result.rowsAffected);	
	});
};

orclHelper.prototype.executeScalar = function (sql) {
	var enumerator = argEnumerator(arguments);
	var params = enumerator.next('object') || {};
	var cb = enumerator.next('function') || orclHelper._noop;
	this._execute(sql, params, function(result){
		cb(result.rows ? result.rows[0][0] : null);	
	});
}

orclHelper.prototype.execute = function (sql) {
	var enumerator = argEnumerator(arguments);
	var params = enumerator.next('object') || {};
	var cb = enumerator.next('function') || orclHelper._noop;
	this._execute(sql, params, cb);
}

orclHelper.prototype.executeResultSet = function (sql) {
	var enumerator = argEnumerator(arguments);
	var params = enumerator.next('object') || {};
	var cb = enumerator.next('function') || orclHelper._noop;
	var that = this;
	orclHelper._conn(this.user, this.pass, this.db, function (err, conn) {
		if (err) {
			that.onerr(err);
			return;
		}
		conn.execute(sql, params, { resultSet: true }, function (err, result) {
			if (err) {
				that.onerr(err);
				return;
			}
			cb(result.resultSet, function () {
				conn.release(that.onerr);
			});
		});
	});
}