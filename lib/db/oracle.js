var orclConnection = require('oracledb');
var argEnumerator = require('../utils/argEnumerator');

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
	return this._executeWithOption(sql, params, {}, cb);
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
			conn.release(function (err) {
				if (err) that.onerr(err);
			});
		});
	});
	return this;
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
	return this._execute(sql, params, function (result) {
		cb(result.rowsAffected);
	});
}

orclHelper.prototype.executeScalar = function (sql) {
	var enumerator = argEnumerator(arguments);
	var params = enumerator.next('object') || {};
	var cb = enumerator.next('function') || orclHelper._noop;
	return this._execute(sql, params, function (result) {
		cb(result.rows ? result.rows[0][0] : null);
	});
}

orclHelper.prototype.execute = function (sql) {
	var enumerator = argEnumerator(arguments);
	var params = enumerator.next('object') || {};
	var cb = enumerator.next('function') || orclHelper._noop;
	return this._execute(sql, params, cb);
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
	return this;
}

orclHelper.prototype.tables = function (cb) {
	return this.execute('select table_name from user_tables', cb);
}

orclHelper.prototype.columns = function(table, cb){
	return this.execute('select column_name, data_type, data_length from user_tab_cols where table_name=":table"', [table], cb);
}

orclHelper.prototype.testConnection = function(cb){
	return this.executeScalar('select 1 from user_tables', function(ok){
		cb(!!ok);
	});
}

orclHelper.getTNS = function(cb){
	var paths = process.env.PATH.split(';');
	var find = null;
	paths.forEach(function(p){
		if(p.indexOf('oracle') >= 0 && p.indexOf('bin') >= 0) find = p;
	});
	if(!find) return cb(null);
	var path = find.substr(0, find.lastIndexOf('\\')) + '\\NETWORK\\ADMIN\\tnsnames.ora';
	var fs = require('fs');
	fs.exists(path, function(exist){
		if(!exist) return cb(null);
		fs.readFile(path, function(err, content){
			if(err) return cb(null);
			
			var lines = content.toString().split('\r\n');
			cb(lines.filter(function(l){
				return '# 	\r\n'.indexOf(l[0]) < 0;
			}).filter(function(s){
				return s && s.length > 0;
			}).map(function(s){
				return s.replace('=', '').trim();
			}));
		});
	})
}