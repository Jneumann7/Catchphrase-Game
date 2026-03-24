// Client-side script for Catchphrase game, handles UI interactions and communicates with server via WebSockets
// Join game with entered name
function join() {
  const name = document.getElementById("name").value;
  socket.emit("join_game", name);
}

// Update player list when server sends updated list
socket.on("update_players", (players) => {
  const list = document.getElementById("players");
  list.innerHTML = "";

  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    list.appendChild(li);
  });
});

// Start round and send event to server
function startRound() {
  socket.emit("start_round");
}

// Send guess event to server when player clicks guess button
function guess() {
  socket.emit("guess");
}

// Update UI when round starts and when a winner is declared
socket.on("round_started", () => {
  document.getElementById("result").textContent = "Round started!";
});

// Show winner and time when server sends round_winner event
socket.on("round_winner", ({ playerId, time }) => {
  document.getElementById("result").textContent =
    `Winner! Time: ${time} ms`;
});