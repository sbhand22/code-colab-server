import { Socket } from "socket.io"

type SocketId = string

enum SocketEvent {
	// Chat System
	SEND_CHAT_MESSAGE = "send-chat-message",
	RECEIVE_CHAT_MESSAGE = "receive-chat-message",
	START_TYPING = "start-typing",
	PAUSE_TYPING = "pause-typing",

	// Drawing/Sketching
	INIT_DRAWING = "init-drawing",
	SYNC_SKETCH = "sync-sketch",
	UPDATE_SKETCH = "update-sketch",

	// User Connection/Disconnection
	REQUEST_JOIN = "request-join",
	ACCEPT_JOIN = "accept-join",
	NEW_USER_CONNECTED = "new-user-connected",
	USER_LEFT = "user-left",
	SET_USER_ONLINE = "set-user-online",
	SET_USER_OFFLINE = "set-user-offline",
	USERNAME_ALREADY_TAKEN = "username-already-taken",

	// File System Operations
	UPDATE_FILE_SYSTEM = "update-file-system",
	CREATE_FOLDER = "create-folder",
	MODIFY_FOLDER = "modify-folder",
	RENAME_FOLDER = "rename-folder",
	DELETE_FOLDER = "delete-folder",
	CREATE_FILE = "create-file",
	UPDATE_FILE = "update-file",
	RENAME_FILE = "rename-file",
	REMOVE_FILE = "remove-file",
}


interface SocketContext {
	socket: Socket
}

export { SocketEvent, SocketContext, SocketId }
