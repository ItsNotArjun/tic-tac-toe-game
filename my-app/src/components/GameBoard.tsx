import { title } from "process";
import * as React from 'react';
import '../App.css';
import { Network, Message } from '../backend'
// import './App.css';

// let positions: string[];

type SquareProps = {
  value: string;
  onSquareClick: any;
};

type BoardProps = {
  roomCode: string;
  start: number;
  player: number;
  currentState: { board: string[], currentPlayer: number };
  gameEnd: string;
};

var currentTurn: number = 0;
var played: boolean[] = new Array(9).fill(false);
export default function GameBoard({ roomCode, start, player, currentState, gameEnd }: BoardProps) {

  const [waiting, setWaiting] = React.useState(true);
  const [initial, setInitial] = React.useState(false);

  React.useEffect(() => {
    if (!currentState.board) {
      setInitial(false);
    }
    else {
      setInitial(false);
      let x = false;
      for (let i = 0; i < currentState.board.length; i++) {
        if (currentState.board[i] !== " ") {
          x = true;
        }
      }

      if (!x) {
        if (start > 0) {
          setInitial(true);
        }
      }
    }
  }, [currentState, start])

  React.useEffect(() => {
    if (!currentState.board) {
      setWaiting(false);
    }
    else {
      let x = false;
      for (let i = 0; i < currentState.board.length; i++) {
        if (currentState.board[i] !== " ") {
          x = true;
        }
      }
      if (!x) {
        if (initial) {
          setWaiting(false);
        }
      }
    }
  }, [initial])

  const Square = ({ value, onSquareClick }: SquareProps) => {
    return (
      <div onClick={onSquareClick} style={{ width: 100, height: 100, position: "relative", textAlign: "center", float: "right", border: "1px solid black" }}>
        <text style={{ fontSize: 80 }}>{value}</text>
      </div>
    );
  };

  const [test, setTest] = React.useState([' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']);
  const winning = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  var gameOver: boolean = false;
  var won: string = 'O won!';

  if (currentTurn >= 9) {
    gameOver = true;
    won = "It's a tie!";
  }

  for (let i = 0; i < winning.length; i++) {
    if (test[winning[i][0]] == test[winning[i][1]] && test[winning[i][1]] == test[winning[i][2]] && test[winning[i][0]] != ' ') {
      for (let i = 0; i < played.length; i++) {
        played[i] = true;
      }
      gameOver = true;
      if (test[winning[i][0]] == 'X') {
        won = 'X won!';
      }
    }
  }

  function handleClick(i: number) {
    if (gameEnd === "") {
      let pos: string[] = [];
      if (currentState.board) {
        pos = [...currentState.board]
      }
      else {
        pos = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
      }

      if (player === currentState.currentPlayer) {

        if (currentState.board[i] === " ") {
          if (player === 1) {
            pos[i] = "X";
          }
          else {
            pos[i] = "O";
          }
        }

        Network.getNetwork().updateBoard(pos);
      }
    }
  }

  function playAgain() {
    currentTurn = 0;
    setTest([' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']);
    for (let i = 0; i < played.length; i++) {
      played[i] = false;
      gameOver = true;
    }
  }

  console.log(`I am player ${player}`);
  console.log(`its ${currentState.currentPlayer}'s chance to play`)
  return (
    <>
      <div style={{ fontSize: 18, marginBottom: 20, marginTop: 5, marginLeft: 5 }}>Room code: <strong>{roomCode}</strong></div>
      <div style={{ width: 450, height: 350, position: "relative", left: window.innerWidth / 2 - 175, paddingTop: 250, textAlign: "center" }}>
        <div style={{ position: "relative", float: "left" }}>
          <div style={{ paddingBottom: 10 }}>
            <text style={{ fontSize: 40 }}>{gameEnd}</text>
          </div>
          {
            initial
              ? <div style={{ paddingBottom: 10 }}>
                <text style={{ fontSize: 30 }}>Player {start} goes first!</text>
              </div>
              : <></>
          }
          {
            waiting
              ? <div style={{ paddingBottom: 10 }}>
                <text style={{ fontSize: 30 }}>Waiting for player 2 to join</text>
              </div>
              : <></>
          }
          <div className="board-row" style={{ height: 100, padding: 0 }} >
            <Square value={currentState.board[0]} onSquareClick={() => handleClick(0)} />
            <Square value={currentState.board[1]} onSquareClick={() => handleClick(1)} />
            <Square value={currentState.board[2]} onSquareClick={() => handleClick(2)} />
          </div>
          <div className="board-row" style={{ height: 100, padding: 0 }}>
            <Square value={currentState.board[3]} onSquareClick={() => handleClick(3)} />
            <Square value={currentState.board[4]} onSquareClick={() => handleClick(4)} />
            <Square value={currentState.board[5]} onSquareClick={() => handleClick(5)} />
          </div>
          <div className="board-row" style={{ height: 101, padding: 0 }}>
            <Square value={currentState.board[6]} onSquareClick={() => handleClick(6)} />
            <Square value={currentState.board[7]} onSquareClick={() => handleClick(7)} />
            <Square value={currentState.board[8]} onSquareClick={() => handleClick(8)} />
          </div>
        </div>
        {
          gameOver
            ? <div onClick={playAgain} style={{ width: 110, height: 32, position: "relative", float: "right", borderRadius: 6, top: "50%", cursor: "pointer", background: "#00c5ff", color: "white" }}>
              <text style={{ fontSize: 20 }}>play again?</text>
            </div>
            : <></>
        }
      </div>

    </>
  );
}

//  export default gameBoard;

