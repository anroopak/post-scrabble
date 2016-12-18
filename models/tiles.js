'use strict';

class Tiles {
	constructor(json) {
		this._letter = json.letter;
		this._points = json.points;
		this._count = json.count;
	}

	static allTiles() {
		/**
		 * 1 point: E ×12, A ×9, I ×9, O ×8, N ×6, R ×6, T ×6, L ×4, S ×4, U ×4
		 * 2 points: D ×4, G ×3
		 * 3 points: B ×2, C ×2, M ×2, P ×2
		 * 4 points: F ×2, H ×2, V ×2, W ×2, Y ×2
		 * 5 points: K ×1
		 * 8 points: J ×1, X ×1
		 * 10 points: Q ×1, Z ×1
		 */
		return {
			"A": {
				"count": 9,
				"points": 1
			},
			"C": {
				"count": 2,
				"points": 3
			},
			"B": {
				"count": 2,
				"points": 3
			},
			"E": {
				"count": 12,
				"points": 1
			},
			"D": {
				"count": 4,
				"points": 2
			},
			"G": {
				"count": 3,
				"points": 2
			},
			"F": {
				"count": 2,
				"points": 4
			},
			"I": {
				"count": 9,
				"points": 1
			},
			"H": {
				"count": 2,
				"points": 4
			},
			"K": {
				"count": 1,
				"points": 5
			},
			"J": {
				"count": 1,
				"points": 8
			},
			"M": {
				"count": 2,
				"points": 3
			},
			"L": {
				"count": 4,
				"points": 1
			},
			"O": {
				"count": 8,
				"points": 1
			},
			"N": {
				"count": 6,
				"points": 1
			},
			"Q": {
				"count": 1,
				"points": 10
			},
			"P": {
				"count": 2,
				"points": 3
			},
			"S": {
				"count": 4,
				"points": 1
			},
			"R": {
				"count": 6,
				"points": 1
			},
			"U": {
				"count": 4,
				"points": 1
			},
			"T": {
				"count": 6,
				"points": 1
			},
			"W": {
				"count": 2,
				"points": 4
			},
			"V": {
				"count": 2,
				"points": 4
			},
			"Y": {
				"count": 2,
				"points": 4
			},
			"X": {
				"count": 1,
				"points": 8
			},
			"Z": {
				"count": 1,
				"points": 10
			}
		};
	}
}

module.exports = Tiles;