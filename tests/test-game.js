"use strict";
const should = require('should');
const socketIOClient = require('socket.io-client');

let gameRoomName = "Room1";

describe('Game Logic', function() {

	let player1 = socketIOClient("ws://localhost:3000");
	let player2 = socketIOClient("ws://localhost:3000");
	let player3 = socketIOClient("ws://localhost:3000");
	let player4 = socketIOClient("ws://localhost:3000");

	player1.emit('login', {
		user: {
			name: "Player 1"
		}
	});
	player2.emit('login', {
		user: {
			name: "Player 2"
		}
	});
	player3.emit('login', {
		user: {
			name: "Player 3"
		}
	});
	player4.emit('login', {
		user: {
			name: "Player 4"
		}
	});

	player1.emit('control', {
		control: 'createRoom',
		name: gameRoomName
	});
	player2.emit('control', {
		control: 'joinRoom',
		name: gameRoomName
	});
	player3.emit('control', {
		control: 'joinRoom',
		name: gameRoomName
	});
	player4.emit('control', {
		control: 'joinRoom',
		name: gameRoomName
	});

	it('Start Game', function(done) {
		setTimeout(function() {
			player1.emit('control', {
				control: 'startGame'
			});
			player2.on('game', data => {
				console.log(data);
				data.operation.should.be.equal('startGame');
				done();
			});
		}, 300);
	});


	it('Place Word | Inital', function(done) {
		setTimeout(function() {
			player1.on('game', data => {
				let tiles = data.tiles['Player 1'];
				let word = tiles.slice(0, 3).join('');
				console.log(word);
				player1.emit('game', {
					operation: 'placeWord',
					word: word,
				});
				player1.on('game', data => {
					console.log(data);
					data.operation.should.be.equal('nextSetTiles');
					done();
				});
			});
		}, 600);
	});

});