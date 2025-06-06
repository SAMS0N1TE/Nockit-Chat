const SERVER_URL = 'https://nockit-chat.onrender.com'; // Adjust if deploying elsewhere

let socket, username;

function initChat() {
  socket = io(SERVER_URL);

  socket.on('load all messages', (messages) => {
    messages.forEach(addMessage);
  });

  socket.on('chat message', addMessage);

  document.getElementById('message-form').onsubmit = function(e) {
    e.preventDefault();
    const input = document.getElementById('m');
    if (input.value.trim()) {
      socket.emit('chat message', { username, text: input.value.trim() });
      input.value = '';
    }
  };
}

function addMessage(data) {
  const li = document.createElement('li');
  li.textContent = `${data.username}: ${data.text}`;
  if (data.username === username) li.className = 'self';
  document.getElementById('messages').appendChild(li);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

document.getElementById('login-form').onsubmit = function(e) {
  e.preventDefault();
  const uname = document.getElementById('login-username').value.trim();
  if (!uname) return;
  username = uname;
  document.getElementById('login-panel').style.display = 'none';
  document.getElementById('chat-panel').style.display = '';
  initChat();
};
