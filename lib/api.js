var express = require('express');
var router = express.Router({ caseSensitive: true });
var sender = require('./utils/dataSender');
var Promise = require("bluebird");
var redis = Promise.promisifyAll(require('redis'));
var db = redis.createClient();

router.post('/testConnection', sender('testConnection'));

router.get('/oracleTNS', function (req, res) {
	require('./db/oracle').getTNS(sender(res, []));
});

router.post('/tables', sender('tables'));

router.post('/columns', sender('columns', 'table'));

router.post('/save', function (req, res) {
	var data = req.body;
	db.sadd([data.type + ':pref:' + data.key].concat(data.value || {}));
});

router.get('/load/:type/:key', function (req, res) {
	var data = req.params;
	db.smembersAsync(data.type + ':pref:' + data.key).then(sender(res, [])).error(sender(res, []));
});

module.exports = router;