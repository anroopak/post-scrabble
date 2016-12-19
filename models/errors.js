'use strict';

class PostScrabbleErrors {

	/**
	 * Error when the control does not exist
	 */
	static ControlDoesNotExist(){
		return new Error("CONTROL_DOESNT_EXISTS");
	}

	/**
	 * Error when the member count has increased.
	 */
	static RoomMemberCountExceeded() {
		return new Error("ROOM_MEM_COUNT_EXCEED");
	}

	/**
	 * Error when Room with the name already exists.
	 */
	static RoomAlreadyExist(){
		return new Error("ROOM_ALREADY_EXIST");
	}

	/**
	 * Error when a requested Room doesnt exist.
	 */
	static RoomDoesntExist(){
		return new Error("ROOM_DOESNT_EXIST");
	}

	/**
	 * Error when a member tries to join after Game started. 
	 */
	static RoomAlreadyStarted(){
		return new Error("ROOM_GAME_STARTED");
	}
}

module.exports = PostScrabbleErrors;