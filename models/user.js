'use strict';
const MongoModel = require('../models/mongo-model.js');

const Schema = {
	name: String,
	email: String,
	password: String
};
const SchemaName = "User";

class User extends MongoModel {
	constructor(json) {
		super(SchemaName, Schema);
		this._id = json.id;
		this._name = json.name;
		this._email = json.email;
		this._password = json.password;
	}
}

module.exports = User;