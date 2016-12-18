'use strict';

const should = require('should');
const randomInt = require('random-int');
const Tiles = require('./tiles.js');
const PostScrabbleRooms = require('./errors.js');

const MAX_MEMBER_COUNT = 4;
const MAX_TILES_PER_USER = 7;
const ALL_TILES = Tiles.allTiles();

class GameRoom {
	constructor(json) {
		this.owner = json.owner;
		this.name = json.name;
		this.members = json.members;
		this.words = json.words || [];
		this.lastWord = json.lastWord || null;
		this.tiles = json.tiles || GameRoom.initTiles();
		this.currentUserIndex = json.currentUserIndex || 0;
	}

	get owner() {
		return this._owner;
	}
	set owner(name) {
		this._owner = name;
	}

	get name() {
		return this._name;
	}
	set name(name) {
		this._name = name;
	}

	get members() {
		return this._members || {};
	}
	set members(members) {
		members.should.be.instanceOf(Array);
		this._members = {};
		members.forEach(ele => {
			this._members[ele.id] = ele;
		});
	}

	joinRoom(member) {
		// console.log(this._members);
		if (Object.keys(this._members).length === MAX_MEMBER_COUNT) {
			throw PostScrabbleRooms.RoomMemberCountExceeded();
		}
		this._members[member.id] = member;
	}

	get words() {
		return this._words;
	}
	set words(words) {
		this._words = words;
	}

	/**
	 * Tiles are letters used to play the game. 
	 * Two classes of tiles - Used and Remaining.
	 * `Used` and `Remaining` as key-value pairs
	 * key is letter, values is the count.
	 * @return {[type]} [description]
	 */
	get tiles() {
		return this._tiles;
	}
	set tiles(tiles) {
		tiles.should.be.Object();
		tiles.remaining.should.be.Object();
		tiles.used.should.be.Object();
		this._tiles = {
			remaining: tiles.remaining,
			used: tiles.used,
			lettersRemaining: GameRoom.initLettersRemaining(),
			countRemaining: GameRoom.countTiles(tiles.remaining),
			countUsed: GameRoom.countTiles(tiles.used)
		};
	}

	static initTiles() {
		let tiles = {};
		// let allTiles = Tiles.allTiles();
		// let allTileKeys = Object(allTiles).keys;
		for (let key in ALL_TILES) {
			tiles[key] = ALL_TILES[key].count;
		}
		return {
			remaining: tiles,
			used: {}
		};
	}

	get lettersRemaining() {
		return this._tiles.lettersRemaining;
	}

	get lastWord() {
		return this._lastWord;
	}
	set lastWord(word) {
		this._lastWord = word;
	}

	get currentUserIndex() {
		return this._currentUserIndex;
	}
	set currentUserIndex(number) {
		this._currentUserIndex = number % Object.keys(this._members).length;
	}

	get currentUser() {
		return this._members[Object.keys(this._members)[this._currentUserIndex]];
	}

	moveControlToNextPlayer() {
		this.currentUserIndex += 1;
	}

	static initLettersRemaining() {
		let chars = [];
		let charCodeA = 'A'.charCodeAt(0);
		for (let i = 26 - 1; i >= 0; i--) {
			chars.push(String.fromCharCode(charCodeA + i));
		}
		return chars;
	}

	static countTiles(tiles) {
		let count = 0;
		for (let key in tiles) {
			count += tiles[key].count;
		}
		return count;
	}

	addToUsedTiles(word) {
		console.log(this._tiles.used);
		for (let i = word.length - 1; i >= 0; i--) {
			let c = word[i].toUpperCase();
			if (!this._tiles.used.hasOwnProperty(c)) {
				this._tiles.used[c] = 1;
			} else {
				this._tiles.used[c] += 1;
			}
		}
	}

	removeFromRemainingTiles(letters) {
		for (let i = letters.length - 1; i >= 0; i--) {
			let c = letters[i].toUpperCase();
			this._tiles.remaining[c] -= 1;
			if (this._tiles.remaining[c] === 0) {
				this._tiles.lettersRemaining.splice(
					this._tiles.lettersRemaining.indexOf(c), 1
				);
			}
		}
	}

	addWord(user, word, lastWordLetter) {
		if (this.lastWord) {
			this.lastWord.indexOf(lastWordLetter).should.notEqual(-1);
		}
		this._words.push({
			user: user,
			word: word
		});
		this.addToUsedTiles(word);
		this.removeFromRemainingTiles(word);

		let lettersToRemove = word.split('');
		lettersToRemove.splice(lettersToRemove.indexOf(lastWordLetter), 1);
		this.removeTilesFromUser(user, lettersToRemove);
		this.addPointsToUser(user, lettersToRemove);
		this.lastWord = word;
	}

	addPointsToUser(user, letters) {
		let points = 0;
		for (let i = letters.length - 1; i >= 0; i--) {
			points += ALL_TILES[letters[i]].points;
		}

		if (!this._members[user.id].points) this._members[user.id].points = 0;
		this._members[user.id].points += points;
	}

	getNextSetTiles(lastWordCount) {
		let nextSet = [];
		for (let i = lastWordCount - 1; i >= 0; i--) {
			let index = randomInt(this.lettersRemaining.length - 1);
			nextSet.push(this.lettersRemaining[index]);
			this.removeFromRemainingTiles(String(this.lettersRemaining[index]));
		}
		return nextSet;
	}

	addTilesToUser(user, lettersToAdd) {
		if (!this._members[user.id].letters) this._members[user.id].letters = [];
		this._members[user.id].letters += lettersToAdd;
	}

	removeTilesFromUser(user, lettersToRemove) {
		console.log("this._members[user.id] : " + JSON.stringify(this._members[user.id]));
		let existingLetters = this._members[user.id].letters;
		console.log("existingLetters : " + JSON.stringify(existingLetters));
		console.log(typeof existingLetters);
		for (let i = lettersToRemove.length - 1; i >= 0; i--) {
			existingLetters.splice(existingLetters.indexOf(lettersToRemove[i]));
		}
		this._members[user.id].letters = existingLetters;
	}

	startGame() {
		// TODO: check if already started
		// TODO: check if creator is starting
		// Init Tiles
		let tilesForUsers = {};
		for (let userId in this._members) {
			let tiles = this.getNextSetTiles(MAX_TILES_PER_USER);
			this.addTilesToUser(this._members[userId], tiles);
			tilesForUsers[userId] = tiles;
		}

		let nextUser = randomInt(Object.keys(this._members).length - 1);
		this.currentUserIndex = nextUser;

		return tilesForUsers;
	}

}

module.exports = GameRoom;