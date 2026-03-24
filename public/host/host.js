// START GAME
function startGame() {
  socket.emit("startGame");
}

// PLAYER LIST
socket.on("playerList", (players) => {
  const list = document.getElementById("players");
  list.innerHTML = "";

  players.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = p.name + (i === 0 ? " (First)" : "");
    list.appendChild(li);
  });
});

// ROUND UPDATE
socket.on("roundUpdate", (data) => {
  document.getElementById("lobby").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  document.getElementById("current").textContent =
    data.currentPlayer + "'s turn";

  document.getElementById("next").textContent =
    "Next: " + data.nextPlayer;

  document.getElementById("last").textContent =
    data.lastCorrectGuesser
      ? "Last correct: " + data.lastCorrectGuesser
      : "";
});

// POPUP
socket.on("correctGuessPopup", (data) => {
  alert(data.guesser + " guessed correctly!");
});