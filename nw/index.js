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
  ws.on("message", (data) => {
    let message;
    message = JSON.parse(data);
    console.log(JSON.stringify(message));

    if (message.type === "create") {
      const roomCode = generateRoomCode();
      rooms[roomCode] = { players: [ws], gameState: initGameState() };
      ws.roomCode = roomCode;
      ws.playerIndex = 0;
      ws.send(
        JSON.stringify({ type: "created", roomCode: roomCode, playerIndex: 0 })
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
      let gameBoard = room.gameState.board;

      if (room.gameState.currentPlayer === ws.playerIndex) {
        gameBoard = message.gameBoard;
        console.log(`gameboard from message is ${gameBoard}`);
        room.gameState.currentPlayer = 1 - ws.playerIndex;
      }
      const toSend = { type: "update", gameState: { board: gameBoard, currentPlayer: room.gameState.currentPlayer } }
      console.log(`sending ${JSON.stringify(toSend)} to ${room.players.length} players`);
      room.players.forEach(p =>
        p.send(JSON.stringify(toSend))
      )
      //   const room = rooms[ws.roomCode];
      //   if (!room || !room.players.includes(ws)) return;

      //   const { x, y } = message;
      //   const currentPlayer = ws.playerIndex;

      //   if (
      //     room.gameState.board[y][x] === null &&
      //     room.gameState.currentPlayer === currentPlayer
      //   ) {
      //     room.gameState.board[y][x] = currentPlayer;
      //     room.gameState.currentPlayer = 1 - currentPlayer;

      //     // Broadcast updated game state
      //     room.players.forEach(player =>
      //       player.send(
      //         JSON.stringify({
      //           type: "update",
      //           gameState: room.gameState
      //         })
      //       )
      //     );
      //   }
    }
  });

  ws.on("close", () => {
    const roomCode = ws.roomCode;
    const room = rooms[roomCode];
    if (room > 0) {
      room.players = room.players.filter(p => p !== ws);
      if (room.players.length === 0) {
        delete rooms[roomCode];
      } else {
        room.players[0].send(JSON.stringify({ type: "opponent-left" }));
      }
    }
  });
});

function initGameState() {
  return {
    board: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], currentPlayer: Math.random() >= 0.5 ? 1 : 0
  };
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
