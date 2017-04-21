'use strict';
require('ts-node/register');
const fs = require('fs');
const app = require('./src/app.ts');
const config = require('./src/config.ts').Config;
const debug = require('debug')('api')
let server;
if (app.get('env') === 'production' && config.https_port && config.https_options && config.https_options.cert) {
	const https = require('https');
	const http = require('http');
	server = https.createServer({
		key: fs.readFileSync(config.https_options.key),
		cert: fs.readFileSync(config.https_options.cert),
	}, app).listen(config.https_port, () => debug('Express server listening on port ' + server.address().port));
	http.createServer(app).listen(config.http_port);
} else {
	server = app.listen(config.http_port, () => debug('Express server listening on port ' + server.address().port));
}

module.exports = server;
