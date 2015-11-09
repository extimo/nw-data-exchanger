var db = require('../db/operator');

module.exports = function() {
	var transformErr = arguments[1] || function(){return null};
	var transformData = arguments[2] || function(data){return data};
	var f = arguments[0];
	
	if(typeof(f) == "string"){
		return (function(f){
			return function(req, res){
				db(req.body, function(err){
					res.send(transformErr(err));
				})[f](function (data) {
					res.send(transformData(data));
				});
			};
		})(f);
	}
	
	return (function(f){
		return function(data){
			f.send(data);
		}
	})(f);
}