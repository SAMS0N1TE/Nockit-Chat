const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

const allowedOrigin = 'https://open-chat.neocities.org';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST'],
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.static(path.join(__dirname, 'public')));

const messageHistory = [];

io.on('connection', (socket) => {
  socket.emit('load all messages', messageHistory);

  socket.on('chat message', (data) => {
    messageHistory.push(data);
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
