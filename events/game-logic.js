'use strict';
const logger = require('../utils/logger.js')();
const GameRoom = require('../models/game-room.js');

function placeWord(socket, data) {
	let gameRoom = socket.handshake.session.gameRoom;
	let user = socket.handshake.session.user;
	gameRoom.addWord(user, data.word, data.lastWordLetter);
	let lastWordLength = data.lastWordLetter ? data.word.length - 1 : data.word.length;
	let nextSetTiles = gameRoom.getNextSetTiles(data.word.length);
	logger.debug(user.name + " posted " + data.word);
	socket.handshake.session.gameRoom = gameRoom;
	socket.to(gameRoom.name).emit('game', {
		operation: 'nextSetTiles',
		tiles: nextSetTiles
	});
}

module.exports = {
	placeWord: placeWord
};