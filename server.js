const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configure CORS options for Express
const corsOptions = {
  origin: 'https://open-chat.neocities.org', // Adjust the origin according to your needs
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Initialize socket.io with CORS options
const io = socketIO(server, {
  cors: {
    origin: 'https://open-chat.neocities.org', // Adjust the origin according to your needs
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Serve static files from a directory (e.g., 'public')
app.use(express.static(path.join(__dirname, 'public')));

const messageHistory = []; // Store messages in an array

// Handle connection event for incoming sockets
io.on('connection', (socket) => {
  // Send message history to the newly connected client
  socket.emit('load all messages', messageHistory);

  // Handle 'chat message' event
  socket.on('chat message', (data) => {
    // Save message to history
    messageHistory.push(data);
    // Broadcast the message to all connected sockets
    io.emit('chat message', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});