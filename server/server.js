const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store votes and connections
const votes = {
  optionA: 0,
  optionB: 0
};
const userVotes = new Map(); // Track user votes

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send current votes to new connection
  socket.emit('current_votes', votes);
  io.emit('connection_count', io.engine.clientsCount);

  // Handle votes
  socket.on('vote', (option) => {
    const previousVote = userVotes.get(socket.id);
    
    // Remove previous vote if exists
    if (previousVote) {
      votes[previousVote]--;
    }
    
    // Add new vote
    votes[option]++;
    userVotes.set(socket.id, option);
    
    // Broadcast updated votes
    io.emit('vote_update', votes);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userVote = userVotes.get(socket.id);
    if (userVote) {
      votes[userVote]--;
      userVotes.delete(socket.id);
      io.emit('vote_update', votes);
    }
    io.emit('connection_count', io.engine.clientsCount);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
