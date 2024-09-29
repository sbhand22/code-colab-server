import express, { Response, Request, NextFunction } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { SocketEvent, SocketId } from "./types/socket";
import { USER_CONNECTION_STATUS, User } from "./types/user";
import { Server } from "socket.io";
import path from "path";

dotenv.config();

const app = express();

app.use(express.json());

app.use(cors());

app.use(express.static(path.join(__dirname, "public"))); // Serve static files

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  maxHttpBufferSize: 1e8,
  pingTimeout: 60000,
});

let userSocketMap: User[] = [];

// Function to get all users in a room
function getUsersInRoom(roomId: string): User[] {
  return userSocketMap.filter((user) => user.roomId == roomId);
}

// Function to get room id by socket id
function getRoomId(socketId: SocketId): string | null {
  const roomId = userSocketMap.find((user) => user.socketId === socketId)?.roomId;

  if (!roomId) {
    console.error("Room ID is undefined for socket ID:", socketId);
    return null;
  }
  return roomId;
}

function getUserBySocketId(socketId: SocketId): User | null {
  const user = userSocketMap.find((user) => user.socketId === socketId);
  if (!user) {
    console.error("User not found for socket ID:", socketId);
    return null;
  }
  return user;
}

io.on("connection", (socket) => {
  io.emit('log', `User connected with socket ID: ${socket.id}`);

  // Handle user actions
  socket.on(SocketEvent.REQUEST_JOIN, ({ roomId, username }) => {
    io.emit('log', `User ${username} requested to join room: ${roomId}`);

    // Check if username exists in the room
    const isUsernameExist = getUsersInRoom(roomId).filter(
      (u) => u.username === username
    );
    if (isUsernameExist.length > 0) {
      io.to(socket.id).emit(SocketEvent.USERNAME_ALREADY_TAKEN);
      io.emit('log', `Username already taken: ${username} in room: ${roomId}`);
      return;
    }

    const user = {
      username,
      roomId,
      status: USER_CONNECTION_STATUS.ONLINE,
      cursorPosition: 0,
      typing: false,
      socketId: socket.id,
      currentFile: null,
    };

    userSocketMap.push(user);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit(SocketEvent.NEW_USER_CONNECTED, { user });
    const users = getUsersInRoom(roomId);
    io.to(socket.id).emit(SocketEvent.ACCEPT_JOIN, { user, users });
    io.emit('log', `User ${username} joined room: ${roomId}`);
  });

  socket.on("disconnecting", () => {
    const user = getUserBySocketId(socket.id);
    if (!user) return;
    const roomId = user.roomId;
    socket.broadcast.to(roomId).emit(SocketEvent.USER_LEFT, { user });
    userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
    socket.leave(roomId);
    io.emit('log', `User ${user.username} disconnected from room: ${roomId}`);
  });

  // Handle file actions
  socket.on(
    SocketEvent.UPDATE_FILE_SYSTEM,
    ({ fileStructure, openFiles, activeFile, socketId }) => {
      io.to(socketId).emit(SocketEvent.UPDATE_FILE_SYSTEM, {
        fileStructure,
        openFiles,
        activeFile,
      });
      io.emit('log', `File system updated for socket ID: ${socketId}`);
    }
  );

  socket.on(
    SocketEvent.CREATE_FOLDER,
    ({ parentDirId, newDirectory }) => {
      const roomId = getRoomId(socket.id);
      if (!roomId) return;
      socket.broadcast.to(roomId).emit(SocketEvent.CREATE_FOLDER, {
        parentDirId,
        newDirectory,
      });
      io.emit('log', `Folder created in room: ${roomId}, parentDirId: ${parentDirId}`);
    }
  );

  socket.on(SocketEvent.MODIFY_FOLDER, ({ dirId, children }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.MODIFY_FOLDER, {
      dirId,
      children,
    });
    io.emit('log', `Folder modified in room: ${roomId}, dirId: ${dirId}`);
  });

  socket.on(SocketEvent.RENAME_FOLDER, ({ dirId, newName }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.RENAME_FOLDER, {
      dirId,
      newName,
    });
    io.emit('log', `Folder renamed in room: ${roomId}, dirId: ${dirId}, newName: ${newName}`);
  });

  socket.on(SocketEvent.DELETE_FOLDER, ({ dirId }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.DELETE_FOLDER, { dirId });
    io.emit('log', `Folder deleted in room: ${roomId}, dirId: ${dirId}`);
  });

  socket.on(SocketEvent.CREATE_FILE, ({ parentDirId, newFile }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.CREATE_FILE, { parentDirId, newFile });
    io.emit('log', `File created in room: ${roomId}, parentDirId: ${parentDirId}`);
  });

  socket.on(SocketEvent.UPDATE_FILE, ({ fileId, newContent }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.UPDATE_FILE, { fileId, newContent });
    io.emit('log', `File updated in room: ${roomId}, fileId: ${fileId}`);
  });

  socket.on(SocketEvent.RENAME_FILE, ({ fileId, newName }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.RENAME_FILE, { fileId, newName });
    io.emit('log', `File renamed in room: ${roomId}, fileId: ${fileId}, newName: ${newName}`);
  });

  socket.on(SocketEvent.REMOVE_FILE, ({ fileId }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.REMOVE_FILE, { fileId });
    io.emit('log', `File removed in room: ${roomId}, fileId: ${fileId}`);
  });

  // Handle user status
  socket.on(SocketEvent.SET_USER_OFFLINE, ({ socketId }) => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socketId) {
        return { ...user, status: USER_CONNECTION_STATUS.OFFLINE };
      }
      return user;
    });
    const roomId = getRoomId(socketId);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.SET_USER_OFFLINE, { socketId });
    io.emit('log', `User offline, socket ID: ${socketId}`);
  });

  socket.on(SocketEvent.SET_USER_ONLINE, ({ socketId }) => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socketId) {
        return { ...user, status: USER_CONNECTION_STATUS.ONLINE };
      }
      return user;
    });
    const roomId = getRoomId(socketId);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.SET_USER_ONLINE, { socketId });
    io.emit('log', `User online, socket ID: ${socketId}`);
  });

  // Handle chat actions
  socket.on(SocketEvent.SEND_CHAT_MESSAGE, ({ message }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.RECEIVE_CHAT_MESSAGE, { message });
    io.emit('log', `Chat message sent in room: ${roomId}, message: ${message}`);
  });

  // Handle cursor position
  socket.on(SocketEvent.START_TYPING, ({ cursorPosition }) => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socket.id) {
        return { ...user, typing: true, cursorPosition };
      }
      return user;
    });
    const user = getUserBySocketId(socket.id);
    if (!user) return;
    const roomId = user.roomId;
    socket.broadcast.to(roomId).emit(SocketEvent.START_TYPING, { user });
    io.emit('log', `User started typing in room: ${roomId}, cursorPosition: ${cursorPosition}`);
  });

  socket.on(SocketEvent.PAUSE_TYPING, () => {
    userSocketMap = userSocketMap.map((user) => {
      if (user.socketId === socket.id) {
        return { ...user, typing: false };
      }
      return user;
    });
    const user = getUserBySocketId(socket.id);
    if (!user) return;
    const roomId = user.roomId;
    socket.broadcast.to(roomId).emit(SocketEvent.PAUSE_TYPING, { user });
    io.emit('log', `User paused typing in room: ${roomId}`);
  });

  socket.on(SocketEvent.INIT_DRAWING, () => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.INIT_DRAWING, { socketId: socket.id });
    io.emit('log', `User started drawing in room: ${roomId}`);
  });

  socket.on(SocketEvent.SYNC_SKETCH, ({ drawingData, socketId }) => {
    socket.broadcast.to(socketId).emit(SocketEvent.SYNC_SKETCH, { drawingData });
    io.emit('log', `Sketch synced for socket ID: ${socketId}`);
  });

  socket.on(SocketEvent.UPDATE_SKETCH, ({ snapshot }) => {
    const roomId = getRoomId(socket.id);
    if (!roomId) return;
    socket.broadcast.to(roomId).emit(SocketEvent.UPDATE_SKETCH, { snapshot });
    io.emit('log', `Sketch updated in room: ${roomId}`);
  });
});

// Logging middleware for HTTP requests
app.use((req: Request, res: Response, next: NextFunction) => {
  const logMessage = `Incoming request: ${req.method} ${req.url}`;
  console.log(logMessage);
  io.emit('log', logMessage);
  next();
});

const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  // Send the index.html file
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
