const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;

const rooms = {}; // { [roomCode]: { players: [ws1, ws2], gameState: {...} } }

app.get("/", (req, res) => {
  res.send("WebSocket Tic Tac Toe server running");
});

function generateRoomCode() {
  let code = Math.floor(10000 * Math.random());
  if (code === 0) {
    code = generateRoomCode()
  }
  return code;
}

wss.on("connection", (ws) => {
  console.log(`connected`);

  ws.on("close", () => {
    const roomCode = ws.roomCode;
    const room = rooms[roomCode];
    if (room) {
      room.players = room.players.filter(p => p !== ws);
      if (room.players.length === 0) {
        delete rooms[roomCode];
      } else {
        room.players[0].send(JSON.stringify({ type: "opponent-left" }));
      }
    }
  });

  ws.on("message", (data) => {
    let message;
    message = JSON.parse(data);
    console.log(JSON.stringify(message));

    if (message.type === "create") {
      const roomCode = generateRoomCode();
      rooms[roomCode] = { players: [ws], gameState: initGameState() };
      ws.roomCode = roomCode;
      ws.playerIndex = 0;
      const toSend = { type: "created", roomCode: roomCode, playerIndex: 0 };
      ws.send(
        JSON.stringify(toSend)
      );
    }

    else if (message.type === "join") {
      const room = rooms[message.roomCode];
      if (room && room.players.length === 1) {
        room.players.push(ws);
        ws.roomCode = message.roomCode;
        ws.playerIndex = 1;

        room.players.forEach((player, index) =>
          // player.send("Player " + (room.gameState.currentPlayer + 1) + " starts!"),
          player.send(
            JSON.stringify({
              type: "start",
              roomCode: message.roomCode,
              playerIndex: index,
              gameState: room.gameState
            })
          )
        );
      } else {
        ws.send(JSON.stringify({ type: "err", error: "Invalid or full room" }));
      }
    }

    else if (message.type === "move") {
      const room = rooms[ws.roomCode];
      let gameBoard = room.gameState.gameBoard;
      let gameEnd = "";

      if (room.gameState.currentPlayer === ws.playerIndex) {
        gameBoard = message.gameBoard;
        room.gameState.currentPlayer = 1 - ws.playerIndex;

        const winning = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

        for (let i = 0; i < winning.length; i++) {
          if (gameBoard[winning[i][0]] == gameBoard[winning[i][1]] && gameBoard[winning[i][1]] == gameBoard[winning[i][2]] && gameBoard[winning[i][0]] != ' ') {
            if (gameBoard[winning[i][0]] == 'X') {
              gameEnd = "X won!";
            }
            else {
              gameEnd = "O won!"
            }
          }
        }

        if (gameBoard.filter(p => p != " ").length === 9) {
          gameEnd = "tied!"
        }
      }
      if (gameEnd !== "") {
        room.players.forEach(p =>
          p.send(JSON.stringify({ type: "ended", gameEnd: gameEnd }))
        )
      }

      const toSend = { type: "update", gameState: { gameBoard: gameBoard, currentPlayer: room.gameState.currentPlayer } }
      room.players.forEach(p =>
        p.send(JSON.stringify(toSend))
      )
    }

    else if (message.type === "play-again") {
      const room = rooms[ws.roomCode];

      restart = { type: "restart", gameState: initGameState(), gameEnd: "" }
      room.players.forEach(p =>
        p.send(JSON.stringify(restart))
      )
    }
  });


});

function initGameState() {
  return {
    gameBoard: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], currentPlayer: Math.random() >= 0.5 ? 1 : 0
  };
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
