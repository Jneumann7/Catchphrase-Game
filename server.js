// Create server with Express and Socket.IO
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const os = require("os");

// Serve static files from "public" directory
app.use(express.static("public")); 

// ================= GAME STATE =================
const gameState = {
  players: [],
  currentPlayerIndex: 0,
  currentWord: "",
  wordList: ["Apple", "Car", "Ocean", "Pizza", "Computer"],
  gameStarted: false,
  roundStartTime: null,
  lastCorrectGuesser: null
};

// ================= HELPERS =================
// Get next player in the list
function getNextPlayer() {
  return gameState.players[
    (gameState.currentPlayerIndex + 1) % gameState.players.length
  ];
}

// Start a new turn
function startTurn() {
  // If no players, do nothing; prevent a game with no players
  if (gameState.players.length === 0) return;

  const player = gameState.players[gameState.currentPlayerIndex];

  // Pick a random word for the current player
  gameState.currentWord =
    gameState.wordList[Math.floor(Math.random() * gameState.wordList.length)];

  // Used to track how long the current player has been giving hints
  gameState.roundStartTime = Date.now();

  // Notify all clients about the new round and who is giving hints
  io.emit("roundUpdate", {
    currentPlayer: player.name,
    nextPlayer: getNextPlayer().name,
    lastCorrectGuesser: gameState.lastCorrectGuesser
  });

  // Send word ONLY to current player
  io.to(player.id).emit("yourTurn", {
    word: gameState.currentWord,
    players: gameState.players.filter(p => p.id !== player.id)
  });
}

// ================= SOCKET EVENTS =================
// Handle client connections
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join game
  socket.on("joinGame", (name) => {
    // Add player to game state
    gameState.players.push({
      id: socket.id,
      name,
      correctGuesses: 0
    });

    // Notify all clients about the updated player list
    io.emit("playerList", gameState.players);
  });

  // Start game (host)
  socket.on("startGame", () => {
    // Only allow starting if there are at least 2 players
    if (gameState.players.length < 2) return;

    gameState.gameStarted = true;
    gameState.currentPlayerIndex = 0;
    gameState.lastCorrectGuesser = null;

    startTurn();
  });

  // Correct guess
  socket.on("correctGuess", (guesserId) => {
    // Find the guesser in the player list
    const guesser = gameState.players.find(p => p.id === guesserId);

    if (!guesser) return;

    // Increment correct guess count for the guesser, update last correct guesser, and notify clients
    guesser.correctGuesses++;
    gameState.lastCorrectGuesser = guesser.name;

    io.emit("correctGuessPopup", {
      guesser: guesser.name
    });

    // Next player
    gameState.currentPlayerIndex =
      (gameState.currentPlayerIndex + 1) % gameState.players.length;

    setTimeout(() => {
      startTurn();
    }, 1000);
  });

  // Skip word
  socket.on("skipWord", () => {
    startTurn();
  });

  // Disconnect
  socket.on("disconnect", () => {
    // Remove player from game state and notify clients
    gameState.players = gameState.players.filter(p => p.id !== socket.id);
    io.emit("playerList", gameState.players);
  });
});

// Get local IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let net of interfaces[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
}
// Define port and start server
const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://${getLocalIP()}:${PORT}`);
  console.log(`Host Link is http://${getLocalIP()}:${PORT}?role=host`);
});