// Serves Frontend and handles WebSocket connections for the game
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static("public"));

// Game state
let game = {
  players: [],
  currentRound: null,
};

// Socket connection
// Runs when player connects, handles game events (join, start round, guess, disconnect)
io.on("connection", (socket) => {
  console.log("A player connected");

  socket.on("join_game", (name) => {
    const player = { id: socket.id, name };
    game.players.push(player);

    io.emit("update_players", game.players);
  });

  socket.on("start_round", () => {
    game.currentRound = {
      startTime: Date.now(),
      active: true,
    };

    io.emit("round_started");
  });

  socket.on("guess", () => {
    if (!game.currentRound || !game.currentRound.active) return;

    const time = Date.now() - game.currentRound.startTime;

    game.currentRound.active = false;

    io.emit("round_winner", {
      playerId: socket.id,
      time,
    });
  });

  socket.on("disconnect", () => {
    game.players = game.players.filter(p => p.id !== socket.id);
    io.emit("update_players", game.players);
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
});