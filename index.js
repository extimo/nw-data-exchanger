var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var server = require("http").Server(app);
var io = require('socket.io')(server);
require('./lib/io/handler')(io);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/static'));
app.use('/api', require('./lib/api'));
app.use(function (req, res) {
	res.redirect('/');
});

server.listen(8021);
require('open')('http://localhost:8021/');