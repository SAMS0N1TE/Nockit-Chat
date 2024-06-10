const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIO = require('socket.io');

const messageHistory = []; // Store messages in an array

const server = http.createServer((req, res) => {
  // Define the MIME type mapping
  const mimeType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ttf': 'application/font-ttf',
    '.png': 'image/png',
    '.mp3': 'audio/mpeg',
  };

  // Serve files based on their extension and provide a default case for 404 errors
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': mimeType[ext] || 'text/plain' });
    res.end(content);
  });
});

// Attach socket.io to the server
const io = socketIO(server);

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

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});