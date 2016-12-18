"use strict";

const bunyan = require('bunyan');
const logger = bunyan.createLogger({
	name: 'PostScrabble',
	streams: [{
		level: 'debug',
		stream: process.stdout
	}]
});

function getLogger(){
	return logger;
}

module.exports = getLogger;