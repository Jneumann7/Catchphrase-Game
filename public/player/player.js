let myName = "";

// JOIN GAME
function joinGame() {
  myName = document.getElementById("nameInput").value;

  socket.emit("joinGame", myName);

  document.getElementById("joinScreen").classList.add("hidden");
  document.getElementById("waitingScreen").classList.remove("hidden");
}

// SKIP WORD
function skipWord() {
  socket.emit("skipWord");
}

// PLAYER LIST UPDATE
socket.on("playerList", (players) => {
  if (players.length > 0 && players[0].name === myName) {
    document.getElementById("firstNotice").textContent =
      "You are going first";
  }
});

// ROUND UPDATE
socket.on("roundUpdate", (data) => {

  document.getElementById("waitingScreen").classList.add("hidden");

  // NOT YOUR TURN
  if (data.currentPlayer !== myName) {
    document.getElementById("yourTurnScreen").classList.add("hidden");
    document.getElementById("notTurnScreen").classList.remove("hidden");

    document.getElementById("prompt").textContent =
      "Guess " + data.currentPlayer + "'s word";

    document.getElementById("next").textContent =
      data.nextPlayer === myName ? "You are up next" : "";
  }
});

// YOUR TURN
socket.on("yourTurn", (data) => {

  document.getElementById("notTurnScreen").classList.add("hidden");
  document.getElementById("yourTurnScreen").classList.remove("hidden");

  document.getElementById("word").textContent = data.word;

  const container = document.getElementById("buttons");
  container.innerHTML = "";

  data.players.forEach(p => {
    const btn = document.createElement("button");
    btn.textContent = p.name;

    btn.onclick = () => {
      socket.emit("correctGuess", p.id);
    };

    container.appendChild(btn);
  });
});