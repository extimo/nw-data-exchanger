var express = require('express');
var router = express.Router({ caseSensitive: true });
var Oracle = require('./db/oracle');

router.post('/testConnection', function (req, res) {
	var db;
	switch (req.body.type) {
		case 'orc':
			db = new Oracle(req.body.user, req.body.pass, req.body.db, function () {
				res.end('false');
			});
	}

	db.testConnection(function (success) {
		res.end((!!success).toString());
	})
});

router.get('/oracleTNS', function (req, res) {
	Oracle.getTNS(function(tns){
		res.send(tns || '');
	});
});

module.exports = router;