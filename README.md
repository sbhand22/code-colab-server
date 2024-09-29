# Real-Time Code Collaboration Backend

This is the backend for the **Code Collaboration** web app which i tried to learn and log scoket connection to do realtime data tranfer. The backend is built using Node.js and Express and provides support for real-time collaboration via WebSocket (Socket.IO).

## Introduction

The  Code Collaboration backend is the server-side component of a web application designed for developers to collaborate on code in real-time. This platform allows multiple users to join rooms, share files, and work on code together in a collaborative environment.

The server manages user connections using WebSockets and facilitates the real-time exchange of data, such as:
- Users joining or leaving rooms.
- Live editing of files with synchronized updates across all connected users.
- Broadcasting typing indicators and user presence.

The backend ensures that all users in a room see the same version of a file or document, with instant updates sent as soon as changes are made. The server also manages the lifecycle of rooms and user sessions, ensuring proper notifications for users joining or leaving a session. Built with scalability and ease of development in mind, the backend is flexible for extensions and new features.

### Key Features

- Real-time collaboration on code editing across multiple files.
- File creation, modification, and deletion via WebSockets.
- Room-based collaboration, allowing users to create and join unique collaboration rooms.
- Syntax highlighting for various file types with auto-language detection.
- Instant updates and synchronization of code changes across all files and folders.
- Notifications for user join and leave events.
- Real-time user presence list with online/offline status indicators.
- Collaborative chat functionality.
- Code execution: Execute code within the collaboration environment for instant feedback.
- Customizable coding experience with multiple themes, font sizes, and font families.
- Collaborative drawing: Users can draw and sketch in real-time.
- Auto suggestions based on programming language.
- Option to download the entire codebase as a zip file.

## Technologies and Libraries Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **Socket.IO**: Real-time bidirectional communication between server and clients.
- **CORS**: Middleware for enabling Cross-Origin Resource Sharing.
- **dotenv**: A library to manage environment variables.
- **path**: Node.js module for handling file and directory paths.
- **http**: Native Node.js module for creating the HTTP server.

## Prerequisites

To run this project, you will need the following installed on your machine:

- **Node.js** (v14.x or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)

## Getting Started

Follow these instructions to set up and run the project locally.

1. Clone the Repository
First, clone the repository to your local machine:
```bash
git clone <repo>
cd <root>
```

2. Install Dependencies
Once inside the project directory, run the following command to install all dependencies:
```bash
npm install
```

3. Create a .env File
Create a .env file in the root directory of the project and add any necessary environment variables. Example:
```bash
PORT=<your port>
```

4. Running the Server
To start the backend server, run the following command:

```bash
npm run dev

```