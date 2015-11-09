var express = require('express');
var router = express.Router({ caseSensitive: true });
var sender = require('./utils/dataSender');

router.post('/testConnection', sender('testConnection'));

router.get('/oracleTNS', function (req, res) {
	require('./db/oracle').getTNS(sender(res));
});

router.post('/tables', sender('tables'));

router.post('/columns', sender('columns', 'table'));

module.exports = router;