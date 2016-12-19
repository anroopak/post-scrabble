'use strict';

let socket = io('ws://localhost:3000');
socket.on('connect', function() {
	console.log("Connected");
});

let username = null;
let GameRoom = {};
let gameroomname = null;
let isGameRoomCreated = false;
let lastWord = [];
let myWord = "";
let myWordLetters = [];
let lastWordLetter = null;

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

	// Letters chosen
	$('#myLetters').bind('click', '.letter', function(e) {
		if (GameRoom.currentUser === username && $(e.target).is('.letter')) {
			let letter = $(e.target).find('span').text();
			let points = $(e.target).find('sub').text();
			myWord += letter;
			myWordLetters.push({
				letter: letter,
				points: points
			});
			$("#wordText").val(myWord);
			$(e.target).addClass("hidden");
		}
	});

	// Letters chosen
	$('#lastWordDiv').bind('click', '.letter', function(e) {
		if (GameRoom.currentUser === username && $(e.target).is('.letter') && !lastWordLetter) {
			let letter = $(e.target).find('span').text();
			let points = $(e.target).find('sub').text();
			myWord += letter;
			myWordLetters.push({
				letter: letter,
				points: points
			});
			$("#wordText").val(myWord);
			$(e.target).addClass("letter-clicked");
			lastWordLetter = letter;
		}
	});

	// Reset Button
	$('#resetWordBtn').click(() => {
		myWord = "";
		myWordLetters = [];
		lastWordLetter = null;
		$("#wordText").val(myWord);
		$(".letter").removeClass("hidden");
		$(".letter").removeClass("letter-clicked");
	});

	$("#submitWordBtn").click(() => {
		socket.emit('game', {
			operation: 'placeWord',
			word: myWord,
			wordLetters: myWordLetters,
			lastWordLetter: lastWordLetter
		});
		removeMyTiles(myWord);
	});

	$("#passGameBtn").click(function() {
		socket.emit('game', {
			operation: 'passGame'
		});
	});

	$("#endGameBtn").click(function() {
		console.log("GameRoom.owner : " + JSON.stringify(GameRoom.owner));
		if (GameRoom.owner === username) {
			socket.emit('game', {
				operation: 'endGame'
			});
		}
	});

	$("#newGameBtn").click(function() {
		$("#home").removeClass("hidden");
		$("s#tartGameDiv").removeClass("hidden");
		$("#playing").removeClass("hidden");

		$("#game").addClass("hidden");
		$("#gamePlayDiv").addClass("hidden");
		$("#results").addClass("hidden");
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
					GameRoom.owner = username;
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
				} else {
					$("#alertCreateGameRoom")
						.html("Cannot Join | " + data.message)
						.removeClass("hidden");
				}
		}
	});

	socket.on('game', data => {
		console.log(data);
		let s = "";
		switch (data.operation) {
			case 'playerJoined':
				s = "";
				for (let key in data.members) {
					s += '<strong>' + data.members[key].name + '<strong>, ';
				}
				$("#joinedPlayers").html(s + ' joined.');

				updateHistory(data.newMember.name + ' joined.');
				updatePointsTable(data.newMember, 0);
				break;

			case 'startGame':
				GameRoom.currentUser = data.startUser.name;
				GameRoom.myTiles = data.tiles[username];

				$("#startGameDiv").addClass("hidden");
				$("#gamePlayDiv").removeClass("hidden");
				if (GameRoom.owner === username) {
					$("#endGameBtn").removeClass("hidden");
				}

				updateHistory('Game started.');
				updateMyLetters();
				updateLastWord();
				updateGameControl();
				updateCurrentUser();

				break;

			case 'wordPlaced':
				GameRoom.currentUser = data.nextUser.name;
				GameRoom.lastWord = data.word;
				GameRoom.lastWordLetters = data.wordLetters;

				$("#wordText").val("");

				myWord = "";
				myWordLetters = [];
				lastWordLetter = null;

				updateHistory(data.user.name + ' placed <strong>' + GameRoom.lastWord + '</strong>');
				updatePointsTable(data.user, data.points);
				updateGameControl();
				updateLastWord();
				break;

			case 'passGame':
				GameRoom.currentUser = data.nextUser.name;

				$("#wordText").val("");

				myWord = "";
				myWordLetters = [];
				lastWordLetter = null;

				updateHistory(data.user.name + ' passed chance.');
				updateGameControl();
				break;

			case 'nextSetTiles':
				GameRoom.myTiles = GameRoom.myTiles.concat(data.tiles);
				updateMyLetters();
				break;

			case 'endGame':
				GameRoom = {};
				$("#playing").addClass("hidden");
				$("#passGameBtn").addClass("hidden");
				$("#endGameBtn").addClass("hidden");
				$("#results").removeClass("hidden");
				updateHistory('Game ended.');
		}
	});
});

function updateHistory(text) {
	$("#history").prepend('<p>' + text + '</p>');
}

function updateCurrentUser() {
	$("#statusDiv").html('<h4>Now playing : <strong>' + GameRoom.currentUser + '</strong></h4>');
}

function updateMyLetters() {
	let s = "<h4>My Letters : ";
	for (let i = 0; i < GameRoom.myTiles.length; i++) {
		s += '<span class="letter"><span>' + GameRoom.myTiles[i].letter;
		s += '</span><sub>' + GameRoom.myTiles[i].points + '</sub></span>';
	}
	s += '</h4>';
	$("#letters").html(s);
}

function updateLastWord() {
	let s = "<h4>Last Word : ";
	if (!GameRoom.lastWordLetters || GameRoom.lastWordLetters.length === 0) {
		s += "__";
	} else {
		for (let i = 0; i < GameRoom.lastWordLetters.length; i++) {
			s += '<span class="letter"><span>' + String(GameRoom.lastWordLetters[i].letter).toUpperCase();
			s += '</span><sub>' + GameRoom.lastWordLetters[i].points + '</sub></span>';
		}
	}
	s += '</h4>';
	$("#lastWordDiv").html(s);
}

function removeMyTiles(word) {
	let letters = word.split('');
	if (lastWordLetter) letters.splice(letters.indexOf(lastWordLetter), 1);
	for (let i = letters.length - 1; i >= 0; i--) {
		for (let j = GameRoom.myTiles.length - 1; j >= 0; j--) {
			if (GameRoom.myTiles[j].letter === letters[i]) {
				GameRoom.myTiles.splice(j, 1);
				letters.splice(i, 1);
			}
		}
	}
}

function updateGameControl() {
	console.log("GameRoom.currentUser : " + JSON.stringify(GameRoom.currentUser));
	console.log("username : " + JSON.stringify(username));
	if (GameRoom.currentUser === username) {
		$("#wordDiv").show().animate();
	} else {
		$("#wordDiv").hide().animate();
	}
}

function updatePointsTable(user, points) {
	if (!GameRoom.hasOwnProperty('points')) GameRoom.points = {};
	if (!GameRoom.points.hasOwnProperty(user.name)) GameRoom.points[user.name] = 0;
	GameRoom.points[user.name] += points;

	let sorted = Object.keys(GameRoom.points).sort((a, b) => GameRoom.points[a] - GameRoom.points[b]);

	let s = '<table class="table table-striped table-responsive">';
	s += '<thead><tr><th>#</th><th>Username</th><th>Points</th></tr></thead><tbody>';
	for (let i = sorted.length - 1, j = 1; i >= 0; i--, j++) {
		s += '<tr><td>' + j + '</td><td>' + sorted[i] + '</td><td>' + GameRoom.points[sorted[i]] + '</td></tr>';
	}
	s += '</tbody></table>';
	$("#points").html(s);
	$("#results div").html(s);
}