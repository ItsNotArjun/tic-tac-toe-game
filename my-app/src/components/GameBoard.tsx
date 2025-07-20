import { title } from "process";
import * as React from 'react';
import '../App.css';
import { Network, Message } from '../backend'

type SquareProps = {
  value: string;
  onSquareClick: any;
};

type BoardProps = {
  roomCode: string;
  start: number;
  player: number;
  currentState: { gameBoard: string[], currentPlayer: number };
  gameEnd: string;
  onLeaveRoom: any;
  left: boolean;
};

export default function GameBoard({ roomCode, start, player, currentState, gameEnd, onLeaveRoom, left }: BoardProps) {

  const [waiting, setWaiting] = React.useState(true);
  const [initial, setInitial] = React.useState(false);

  React.useEffect(() => {
    setInitial(false);
    let x = false;
    for (let i = 0; i < currentState.gameBoard.length; i++) {
      if (currentState.gameBoard[i] !== " ") {
        x = true;
      }
    }

    if (!x) {
      if (start > 0) {
        setInitial(true);
      }
    }
  }, [currentState, start])

  React.useEffect(() => {
    setWaiting(true);
    let x = false;
    for (let i = 0; i < currentState.gameBoard.length; i++) {
      if (currentState.gameBoard[i] !== " ") {
        x = true;
      }
    }
    if (!x) {
      if (initial) {
        setWaiting(false);
      }
    }
    else setWaiting(false);

    if (left) {
      setWaiting(true);
    }
  }, [initial, left])

  const Square = ({ value, onSquareClick }: SquareProps) => {
    return (
      <div onClick={onSquareClick} style={{ width: 100, height: 100, position: "relative", textAlign: "center", float: "right", border: "1px solid black" }}>
        <text style={{ fontSize: 80 }}>{value}</text>
      </div>
    );
  };

  function handleClick(i: number) {
    if (gameEnd === "") {
      let pos: string[] = [];
      if (currentState.gameBoard) {
        pos = [...currentState.gameBoard]
      }
      else {
        pos = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
      }

      if (player === currentState.currentPlayer) {

        if (currentState.gameBoard[i] === " ") {
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
    Network.getNetwork().playAgain();
  }

  function leaveRoom() {
    onLeaveRoom();
    Network.getNetwork().reInitConn();
  }


  return (
    <>
      <div style={{ fontSize: 18, marginBottom: 20, marginTop: 5, marginLeft: 5, position: "relative", float: "left" }}>Room code: <strong>{roomCode}</strong></div>
      <div style={{ fontSize: 18, marginBottom: 20, marginTop: 5, marginRight: 10, position: "relative", float: "right" }}><strong>You are Player {player + 1}</strong></div>
      <div style={{ width: 450, height: 350, position: "relative", left: window.innerWidth / 2 - 175, paddingTop: 250, textAlign: "center" }}>
        <div style={{ width: 300, position: "relative", float: "left", alignContent: "center" }}>
          <div style={{ paddingBottom: 10 }}>
            <text style={{ fontSize: 40 }}>{gameEnd}</text>
          </div>
          {
            initial
              ? <div style={{ paddingBottom: 10, display: "flex", justifyContent: "center" }}>
                <text style={{ fontSize: 30 }}>Player {start} goes first!</text>
              </div>
              : <></>
          }
          {
            waiting
              ? <div style={{ paddingBottom: 10, display: "flex", justifyContent: "center" }}>
                <text style={{ fontSize: 30 }}>Waiting for player 2 to join</text>
              </div>
              : <></>
          }
          <div style={{ width: 300, display: "flex", justifyContent: "center" }}>
            <div className="board-row" style={{ height: 100, padding: 0 }} >
              <Square value={currentState.gameBoard[0]} onSquareClick={() => handleClick(0)} />
              <Square value={currentState.gameBoard[1]} onSquareClick={() => handleClick(1)} />
              <Square value={currentState.gameBoard[2]} onSquareClick={() => handleClick(2)} />
            </div>
            <div className="board-row" style={{ height: 100, padding: 0 }}>
              <Square value={currentState.gameBoard[3]} onSquareClick={() => handleClick(3)} />
              <Square value={currentState.gameBoard[4]} onSquareClick={() => handleClick(4)} />
              <Square value={currentState.gameBoard[5]} onSquareClick={() => handleClick(5)} />
            </div>
            <div className="board-row" style={{ height: 101, padding: 0 }}>
              <Square value={currentState.gameBoard[6]} onSquareClick={() => handleClick(6)} />
              <Square value={currentState.gameBoard[7]} onSquareClick={() => handleClick(7)} />
              <Square value={currentState.gameBoard[8]} onSquareClick={() => handleClick(8)} />
            </div>
          </div>
        </div>
        {
          gameEnd !== ""
            ? <div onClick={playAgain} style={{ width: 110, height: 32, position: "relative", float: "right", borderRadius: 6, top: "50%", cursor: "pointer", background: "#00c5ff", color: "white" }}>
              <text style={{ fontSize: 20 }}>play again?</text>
            </div>
            : <></>
        }
        <div onClick={leaveRoom} style={{ width: 110, height: 32, position: "relative", float: "right", borderRadius: 6, top: "50%", cursor: "pointer", background: "#ff3131ff", color: "white", marginTop: 10 }}>
          <text style={{ fontSize: 20 }}>leave room</text>
        </div>
      </div>

    </>
  );
}

//  export default gameBoard;

