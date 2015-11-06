var http = require('http');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function (req, res) {
	var filePath = 'static' + (req.url == '/' ? '/index.html' : req.url);

	var extname = path.extname(filePath);
	var contentType = require('./configs/file-exts')[extname] || 'text/plain';

	fs.exists(filePath, function (exists) {
		if (!exists) {
			res.writeHead(302, {
				'Location': '/'
			});
			return res.end();
		}
		fs.readFile(filePath, function (error, content) {
			if (error) {
				res.writeHead(500);
				res.end();
			}
			else {
				res.writeHead(200, { 'Content-Type': contentType });
				res.end(content, 'utf-8');
			}
		});
	});
});

server.listen(8021);