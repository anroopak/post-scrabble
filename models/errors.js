'use strict';

class PostScrabbleErrors {

	static ControlDoesNotExist(){
		return new Error("CONTROL_DOESNT_EXISTS");
	}

	// Member count for the room exceeded
	static RoomMemberCountExceeded() {
		return new Error("ROOM_MEM_COUNT_EXCEED");
	}

	static RoomAlreadyExist(){
		return new Error("ROOM_ALREADY_EXIST");
	}
	static RoomDoesntExist(){
		return new Error("ROOM_DOESNT_EXIST");
	}
}

module.exports = PostScrabbleErrors;