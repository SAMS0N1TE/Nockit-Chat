document.addEventListener('DOMContentLoaded', function() {
  var socket = io(); // Initialize socket connection
  const messageSound = new Audio('messagesound.mp3'); // Load message sound
  var userColors = {}; // Object to store user-specific colors

  // Function to play message sound
  function playMessageSound() {
    messageSound.currentTime = 0; // Reset sound to start
    messageSound.play().catch(error => {
      console.error('Error playing sound:', error); // Log error if sound play fails
    });
  }

  // Function to generate a random color
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]; // Append random hex digit
    }
    return color;
  }

  // Function to handle form submission
  function submitForm(event) {
    event.preventDefault(); // Prevent default form submission behavior
    var username = document.getElementById('username').value.trim(); // Get trimmed username
    if (!username) {
      alert('Please set a username before sending a message.');
      return;
    }
    if (!userColors[username]) {
      userColors[username] = getRandomColor(); // Assign random color if not already assigned
    }
    var message = document.getElementById('m').value.trim(); // Get trimmed message
    if (message) { // Check if message is not empty
      socket.emit('chat message', { username: username, text: message, color: userColors[username] }); // Emit chat message event
      document.getElementById('m').value = ''; // Clear message input
      playMessageSound(); // Play message sound
      // getAIResponse(message); // This line seems to call an undefined function. Ensure implementation or remove.
    }
    return false;
  }

  // Attach submitForm function to form submission event
  document.querySelector('form').onsubmit = submitForm;

  // Handle 'load all messages' event
  socket.on('load all messages', function(messages) {
    messages.forEach(addMessage); // Add each message to the chat
  });

  // Handle 'chat message' event
  socket.on('chat message', addMessage);

  // Function to add a message to the chat
  function addMessage(data) {
    var item = document.createElement('li'); // Create new list item for message
    var username = document.getElementById('username').value;
    if (data.text) { // If message contains text
      if (data.username === username) {
        item.classList.add('sent-message'); // Mark as sent message
      } else if (data.username === 'Sasha') {
        item.classList.add('ai-message'); // Mark as AI message
      }
      item.textContent = data.username + ': ' + data.text; // Set text content
    } else if (data.image) { // If message contains an image
      var img = new Image();
      img.src = data.image;
      img.style.maxWidth = '200px';
      img.style.maxHeight = '200px';
      item.textContent = data.username + ': ';
      item.appendChild(img); // Append image to list item
    }
    if (data.color) {
      item.style.color = data.color; // Set text color
    }
    document.getElementById('messages').appendChild(item); // Append message to chat
    scrollToBottom(); // Scroll chat to bottom
  }

  // Handle image input change event
  document.getElementById('imageInput').addEventListener('change', function(event) {
    var file = event.target.files[0]; // Get selected file
    var username = document.getElementById('username').value.trim(); // Get trimmed username
    if (!username) {
      alert('Please set a username before sending a message.');
      return;
    }
    if (file instanceof Blob) { // Check if file is a Blob
      var reader = new FileReader();
      reader.onload = function() {
        var dataURL = reader.result;
        if (!userColors[username]) {
          userColors[username] = getRandomColor(); // Assign random color if not already assigned
        }
        socket.emit('chat message', { username: username, text: '', image: dataURL, color: userColors[username] }); // Emit chat message event with image
      };
      reader.readAsDataURL(file); // Read file as Data URL
    } else {
      console.error('Selected file is not a Blob object.');
    }
  });

  // Function to scroll chat to bottom
  function scrollToBottom() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
  }
});