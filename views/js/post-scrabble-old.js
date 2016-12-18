'use strict';
let socket = io('ws://localhost:3000');
// let gameSocket = io();
socket.on('connect', function() {
	console.log("Connected");
});

let username = "";
let gameroomname = "";
let myWord = "";
let lastWordLetter = null;

$(document).ready(function() {
	$("#createRoomBtn").click(function() {
		username = $("#usernameTxt").val();
		gameroomname = $("#gameroomTxt").val();
		socket.emit('login', {
			user: {
				name: username
			}
		});
		socket.emit('control', {
			control: 'createRoom',
			name: gameroomname
		});
	});

	socket.on('control', data => {
		console.log(data);
		switch (data.control) {
			case 'createRoom':
				if (data.status) {
					$("#gameCreationDiv").hide();
					$("#gamePlayDiv").removeClass("hidden");
					socket.emit('control', {
						control: 'startGame'
					});
					// socket.join(gameroomname);
				} else {
					if (data.message === 'ROOM_ALREADY_EXIST') {
						socket.emit('control', {
							control: 'joinRoom',
							name: gameroomname
						});
					} else {
						$("#roomStatusDiv")
							.html("Cannot create | " + data.message)
							.removeClass("hidden");
					}
				}
				break;
			case 'joinRoom':
				if (data.status) {
					$("#gameCreationDiv").hide();
					$("#gamePlayDiv").removeClass("hidden");
					socket.emit('control', {
						control: 'startGame'
					});
				} else {
					$("#roomStatusDiv")
						.html("Cannot create | " + data.message)
						.removeClass("hidden");
				}
		}
	});

	socket.on('game', data => {
		console.log(data);
		switch (data.operation) {
			case 'startGame':
				let tiles = data.tiles;
				let s = "";
				for (let i = tiles[username].length - 1; i >= 0; i--) {
					s += '<span class="letter">' + tiles[username][i] + '<sub>1</sub></span>';
				}
				$("#letters").html(s);
		}
	});

	$('#myLetters').bind('click', '.letter', function(e) {
		let a = $(e.target).text();
		a = a.slice(0, a.indexOf('<sub>'));
		myWord += a;
		$("#wordText").val(myWord);
		$(e.target).addClass("hidden");
	});

	$("#resetWordBtn").click(function(){
		myWord = "";
		$("#wordText").val(myWord);
		$(".letter").removeClass("hidden");
	});

	$("#submitWordBtn").click(function(){
		socket.emit('game', {
			operation: 'placeWord',
			word: myWord,
			lastWordLetter: lastWordLetter
		});
		myWord = "";
		$("#wordText").val(myWord);
		$(".letter").removeClass("hidden");
	});

});