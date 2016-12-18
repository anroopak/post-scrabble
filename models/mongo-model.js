'use strict';

const Promise = require('bluebird');
const mongoose = require('mongoose');
const config = require('config');

const MongoConfig = config.mongodb;
const Schema = mongoose.Schema;

mongoose.Promise = Promise;
mongoose.set('debug', MongoConfig.debug || false);

let connection = mongoose.createConnection(
	MongoConfig.host, {
		poolSize: MongoConfig.poolSize || 10
	});

/**
 * Abstract Class MongoModel : 
 * WARNING : DO NOT USE DIRECTLY 
 */
class MongoModel {
	constructor(SchemaName, Schema) {
		this._schemaName = SchemaName;
		this._schema = Schema;
		this._model = connection.model(this._schemaName, this._schema, this._schemaName);
	}
}

module.exports = MongoModel;