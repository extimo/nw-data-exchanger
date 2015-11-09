var Oracle = require('./oracle');

module.exports = function (option, onerr) {
	onerr = onerr || function () { };

	switch (option.type) {
		case 'orc':
			return new Oracle(option.user, option.pass, option.db, onerr);
		case 'sql':

	}
	
	return {};
};