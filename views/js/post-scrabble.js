'use strict';

let socket = io('ws://localhost:3000');
socket.on('connect', function() {
	console.log("Connected");
});

let username = null;
let GameRoom = {};
let gameroomname = null;
let isGameRoomCreated = false;

$(document).ready(() => {

	// Login Flow
	$("#signInBtn").click(() => {
		username = $("#usernameTxt").val();
		socket.emit('login', {
			user: {
				name: username
			}
		});
		socket.on('login', data => {
			if (data.status === true) {
				$(".username").html(username);
				$("#login-page").addClass("hidden");
				$("#logged-in-page").removeClass("hidden");
			} else {
				$("#alertSignIn")
					.html("Login failed. | Reason : " + data.message)
					.removeClass("hidden");
			}
		});
	});

	// create game room
	$("#createGameBtn").click(() => {
		gameroomname = $("#gameRoomNameTxt").val();
		socket.emit('control', {
			control: 'createRoom',
			name: gameroomname
		});
	});

	// start game
	$("#startGameBtn").click(() => {
		socket.emit('control', {
			control: 'startGame'
		});
	});

	// join game room
	$('#game-list').bind('click', '.joinBtn', (e) => {
		if (!username) {
			$("#alertSignIn")
				.html("User not signed in")
				.removeClass("hidden");
		} else {
			gameroomname = $(e.target).val();
			socket.emit('control', {
				control: 'joinRoom',
				name: gameroomname
			});
		}
	});

	socket.on('gameRoomList', data => {
		console.log(data);
		if (data.rooms.length === 0) {
			$("#noGameMsg").removeClass("hidden");
			$("#game-list > p").addClass("hidden");
		} else {
			let s = '<table class="table table-striped">';
			s += '<thead><tr><th>#</th><th>Game room name</th><th>Operations</th></thead>';
			s += '<tbody>';
			for (let i = data.rooms.length - 1, j = 1; i >= 0; i--, j++) {
				s += '<tr><td>' + j + '</td><td>' + data.rooms[i] + '</td>';
				s += '<td><button type="button" class="joinBtn btn btn-warning btn-xs" value="' + data.rooms[i] + '">Join</button></td></tr>';
			}
			s += '</tbody>';
			s += '</table>';
			$("#game-list > p").html(s).removeClass("hidden");
			$("#noGameMsg").addClass("hidden");
		}
	});


	socket.on('control', data => {
		console.log(data);
		switch (data.control) {
			case 'createRoom':
				if (data.status === true) {
					isGameRoomCreated = true;
					GameRoom.name = gameroomname;
					$(".gameroomname").html(gameroomname);
					$("#home").addClass("hidden");
					$("#game").removeClass("hidden");
				} else {
					$("#alertCreateGameRoom")
						.html("Cannot create | " + data.message)
						.removeClass("hidden");
				}
				break;
			case 'joinRoom':
				if (data.status === true) {
					isGameRoomCreated = false;
					GameRoom.name = gameroomname;
					GameRoom.owner = data.owner;
					$(".gameroomname").html(gameroomname);
					$("#home").addClass("hidden");
					$("#game").removeClass("hidden");
					if (GameRoom.owner !== username) {
						$("#startGameBtn").addClass("hidden");
					}
				}
		}
	});

	socket.on('game', data => {
		console.log(data);
		let s = "";
		switch (data.operation) {
			case 'playerJoined': 
				s = "";
				for(let key in data.members) {
					s += '<strong>' + data.members[key].name + '<strong>, ';
				}
				$("#joinedPlayers").html(s + ' joined.');
				$("#history").append('<p>'+data.newMember+' joined</p>');
				break;
			case 'startGame':
				let tiles = data.tiles;
				GameRoom.currentUser = data.startUser.name;
				s = "";
				for (let i = tiles[username].length - 1; i >= 0; i--) {
					s += '<span class="letter"><span>' + tiles[username][i] + '</span><sub>1</sub></span>';
				}
				$("#letters").html(s);
				$("#startGameDiv").addClass("hidden");
				$("#gamePlayDiv").removeClass("hidden");
				$("#statusDiv").html('Now playing : <strong>'+GameRoom.currentUser+'</strong>');
		}
	});
});