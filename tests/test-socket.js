"use strict";
const should = require('should');
const socketIOClient = require('socket.io-client');

describe('Room', function() {
	let socket1 = socketIOClient("ws://localhost:3000");
	let socket2 = socketIOClient("ws://localhost:3000");
	let socket3 = socketIOClient("ws://localhost:3000");
	let socket4 = socketIOClient("ws://localhost:3000");
	let socket5 = socketIOClient("ws://localhost:3000");
	it('Login', function(done) {
		socket1.emit('login', {
			user: {
				name: "Roopak"
			}
		});
		socket1.on('login', data => {
			data.status.should.be.true();
			done();
		});
	});
	it('Create Room', function(done) {
		socket1.emit('control', {
			control: 'createRoom',
			name: 'abcd',
			user: {
				name: "Roopak"
			}
		});
		socket1.on('control', data => {
			if (data.control === 'createRoom') {
				data.status.should.equal(true);
				done();
			}
		});
	});
	// it('Join Room | True', function(done) {
	// 	socket1.emit('join', {
	// 		name: 'abcd',
	// 		user: {
	// 			name: "Deepak"
	// 		}
	// 	});
	// 	socket1.on('join', data => {
	// 		data.status.should.be.true();
	// 		done();
	// 	});
	// });
	// it('Join Room | Room does not exist', function(done) {
	// 	socket2.emit('join', {
	// 		name: 'abcde',
	// 		user: {
	// 			name: "Deepak"
	// 		}
	// 	});
	// 	socket2.on('join', data => {
	// 		data.status.should.be.false();
	// 		done();
	// 	});
	// });
	// it('Join Room | Exceeds Limit', function(done) {
	// 	socket3.emit('join', {
	// 		name: 'abcd',
	// 		user: {
	// 			name: "User 3"
	// 		}
	// 	});
	// 	socket4.emit('join', {
	// 		name: 'abcd',
	// 		user: {
	// 			name: "User 4"
	// 		}
	// 	});
	// 	socket5.emit('join', {
	// 		name: 'abcd',
	// 		user: {
	// 			name: "User 5"
	// 		}
	// 	});
	// 	socket5.on('join', data => {
	// 		data.message.should.equal("ROOM_MEM_COUNT_EXCEED");
	// 		done();
	// 	});
	// });
});