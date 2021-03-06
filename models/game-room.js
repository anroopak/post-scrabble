'use strict';

const should = require('should');
const randomInt = require('random-int');
const Tiles = require('./tiles.js');
const PostScrabbleRooms = require('./errors.js');

const MAX_MEMBER_COUNT = 4;
const MAX_TILES_PER_USER = 7;
const ALL_TILES = Tiles.allTiles();

/**
 * Model : Game room
 */
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

	/**
	 * Method for a member to Join the Game room
	 * Allows the member to join, if
	 * 	- Game not already started
	 * 	- Max member count not hit.
	 * @param  {Object} member Member Object
	 * @return {None}
	 */
	joinRoom(member) {
		if (this._started) {
			throw PostScrabbleRooms.RoomAlreadyStarted();
		}
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

	/**
	 * Initialises  all Tiles
	 * @return {Object} `remaining` and `used` tiles.
	 */
	static initTiles() {
		let tiles = {};
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

	/**
	 * Moves the Control to next person. 
	 * @return {None}
	 */
	moveControlToNextPlayer() {
		this.currentUserIndex += 1;
	}

	/**
	 * Initialises the Letters Remaining
	 * @return {Array} List of all characters. 
	 */
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

	/**
	 * Adds the letters of the word to `used` tiles set. 
	 * @param {String} word Input word
	 */
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

	/**
	 * Removes the letters from `remaining` list
	 * @param  {Array} letters List of Letters
	 * @return {NIL}         
	 */
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

	/**
	 * Adds a Word to the Game
	 * @param {Object} user           User who played
	 * @param {String} word           Word played by User
	 * @param {String} lastWordLetter Character used from the last word played. 
	 */
	addWord(user, word, lastWordLetter) {
		// if (this.lastWord) {
		// 	this.lastWord.indexOf(lastWordLetter).should.not.equal(-1);
		// }

		this._words.push({
			user: user,
			word: word
		});

		this.addToUsedTiles(word);
		this.removeFromRemainingTiles(word);

		let lettersToRemove = word.split('');
		let points = this.addPointsToUser(user, lettersToRemove);

		if (lastWordLetter) {
			lettersToRemove.splice(lettersToRemove.indexOf(lastWordLetter), 1);
		}

		this.removeTilesFromUser(user, lettersToRemove);
		this.lastWord = word;

		return points;
	}

	/**
	 * Calculates and adds the points to the User
	 * @param {Object} user    User who played
	 * @param {Array} letters List of letters
	 */
	addPointsToUser(user, letters) {
		let points = 0;
		console.log("letters : " + JSON.stringify(letters));
		for (let i = letters.length - 1; i >= 0; i--) {
			console.log(letters[i] + ".points : " + JSON.stringify(ALL_TILES[letters[i]].points));
			points += ALL_TILES[letters[i]].points;
		}

		if (!this._members[user.id].points) this._members[user.id].points = 0;
		this._members[user.id].points += points;
		return points;
	}

	/**
	 * Generates the next set of letters.
	 * @param  {Integer} lastWordCount Length of the word played (1 less if previous word used.)
	 * @return {Array}               New set of Letters. 
	 */
	getNextSetTiles(lastWordCount) {
		let nextSet = [];
		for (let i = lastWordCount - 1; i >= 0; i--) {
			let index = randomInt(this.lettersRemaining.length - 1);
			let c = this.lettersRemaining[index];
			nextSet.push({
				letter: c,
				points: ALL_TILES[c].points
			});
			this.removeFromRemainingTiles(String(this.lettersRemaining[index]));
		}
		return nextSet;
	}

	/**
	 * Adds the Tiles to the User
	 * @param {Object} user         User
	 * @param {Array} lettersToAdd List of tiles to add.
	 */
	addTilesToUser(user, lettersToAdd) {
		if (!this._members[user.id].letters) this._members[user.id].letters = [];
		this._members[user.id].letters += lettersToAdd;
	}

	/**
	 * Removes the tiles from the User
	 * @param  {Object} user            User
	 * @param  {Array} lettersToRemove List of tiles to remove
	 */
	removeTilesFromUser(user, lettersToRemove) {
		console.log("this._members[user.id] : " + JSON.stringify(this._members[user.id]));
		let existingLetters = this._members[user.id].letters;
		for (let i = lettersToRemove.length - 1; i >= 0; i--) {
			for (let j = existingLetters.length - 1; j >= 0; j--) {
				if (existingLetters[j].letter === lettersToRemove[i]) {
					existingLetters.splice(j, 1);
				}
			}
		}
		this._members[user.id].letters = existingLetters;
	}

	/**
	 * Starts the Game
	 * @return {Object} Tiles for the Users. 
	 */
	startGame() {
		// Init Tiles
		this._started = true;
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