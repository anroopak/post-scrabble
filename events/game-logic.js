'use strict';
const logger = require('../utils/logger.js')();
const GameRoom = require('../models/game-room.js');

function placeWord(socket, data) {
	let gameRoom = socket.handshake.session.gameRoom;
	let user = socket.handshake.session.user;
	let points = gameRoom.addWord(user, data.word, data.lastWordLetter);
	let lastWordLength = data.lastWordLetter ? data.word.length - 1 : data.word.length;
	let nextSetTiles = gameRoom.getNextSetTiles(lastWordLength);

	gameRoom.currentUserIndex++;
	logger.debug(user.name + " posted " + data.word);

	socket.handshake.session.gameRoom = gameRoom;
	socket.emit('game', {
		operation: 'nextSetTiles',
		tiles: nextSetTiles,
		points: points
	});

	return points;
}

module.exports = {
	placeWord: placeWord
};