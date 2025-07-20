import * as React from 'react';
import '../App.css';
import { Network, Message } from '../backend'
import GameBoard from '../components/GameBoard';
import { setSelectionRange } from '@testing-library/user-event/dist/utils';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: window.innerHeight,
        backgroundColor: 'white',
        padding: '20px',
        textAlign: 'center',
    } as React.CSSProperties,
    header: {
        marginBottom: '20px',
        fontSize: '32px',
        color: '#333',
    } as React.CSSProperties,
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: '#00c5ff',
        color: 'white',
        borderRadius: '5px'
    } as React.CSSProperties,
    inputContainer: {
        marginTop: '20px',
    } as React.CSSProperties,
    label: {
        fontSize: '16px',
        marginBottom: '8px',
        paddingRight: '10px'
    } as React.CSSProperties,
    inputBox: {
        padding: '10px',
        fontSize: '16px',
        width: '200px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    } as React.CSSProperties,
};

export function Home() {
    const [conn, setConn] = React.useState(false);
    const [isBoard, setIsBoard] = React.useState(false);
    const [roomCode, setRoomCode] = React.useState("");
    const [start, setStart] = React.useState(-1);
    const [player, setPlayer] = React.useState(-1);
    const [currentState, setCurrentState] = React.useState({ board: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], currentPlayer: -1 });

    React.useEffect(() => {
        Network.getNetwork().onMessage((msg: Message) => {
            if (msg.type === "connected") {
                setConn(true);
            }
            else if (msg.type === "created") {
                setIsBoard(true);
                setRoomCode(msg.roomCode);
            }
            else if (msg.type === "err") {
                console.log(msg.error);
            }
            else if (msg.type === "start") {
                setIsBoard(true);
                setConn(true);
                setStart(msg.gameState.currentPlayer);
                setCurrentState({board: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], currentPlayer: msg.gameState.currentPlayer});
            }
            else if (msg.type === "update") {
                setCurrentState(msg.gameState);
                console.log(`updated, new gb is ${JSON.stringify(msg.gameState)}`);
            }
        })
    }, [])

    function joinRoom() {
        // setConn(true);
        let input: any = document.getElementById('room-code');
        setPlayer(1);
        input.addEventListener("keypress", (event: any) => {
            if (event.key === "Enter") {
                Network.getNetwork().joinRoom(input.value);
            }
        });
    }

    function createRoom() {
        // setConn(true);
        Network.getNetwork().createRoom();
        setPlayer(0);
    }

    console.log(`current state is ${JSON.stringify(currentState)}`);
    return (
        <>
            {
                isBoard
                    ? <GameBoard roomCode={roomCode} start={start + 1} player={player} currentState={currentState}/>
                    :
                    <div style={styles.container}>
                        <h1 style={styles.header}>Welcome to Tic Tac Toe</h1>
                        <button style={styles.button} onClick={createRoom} disabled={!conn}>
                            Create Room
                        </button>
                        <div style={styles.inputContainer}>
                            <label style={styles.label}>Enter Room Code:</label>
                            <input
                                disabled={!conn}
                                type="text"
                                maxLength={4}
                                minLength={4}
                                id="room-code"
                                placeholder="code..."
                                style={styles.inputBox}
                                onChange={joinRoom}
                            />
                        </div>
                    </div>
            }

        </>
    );
}

