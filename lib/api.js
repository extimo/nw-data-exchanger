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

module.exports = router;