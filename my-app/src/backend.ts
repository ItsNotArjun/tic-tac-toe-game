import * as React from 'react';
import GameBoard from './components/GameBoard';

type GameState = {
    gameBoard: string[];
    currentPlayer: 0 | 1;
};

export type Message = { type: "connected" }
    | { type: "created"; roomCode: string; playerIndex: number }
    | { type: "start"; roomCode: string; playerIndex: number; gameState: GameState }
    | { type: "update"; gameState: GameState }
    | { type: "opponent-left" }
    | { type: "err", error: string }
    | { type: "ended", gameEnd: string }
    | { type: "restart", gameState: GameState, gameEnd: string }

export class Network {
    private static myInstance: Network | null = null;

    public static getNetwork(): Network {
        if (!Network.myInstance) {
            Network.myInstance = new Network();
        }
        return Network.myInstance;
    }

    private socket: WebSocket;
    private listeners: ((msg: any) => void)[] = [];

    private constructor() {
        this.reInitConn();
    }

    public createRoom() {
        var code: string;
        this.socket.send(JSON.stringify({ type: "create" }));
    }

    public joinRoom(code: string) {
        if (code as unknown as number > 0 && code as unknown as number <= 9999) {
            this.socket.send(JSON.stringify({ type: "join", roomCode: code }));
        }
    }

    public updateBoard(gameBoard: string[]) {
        this.socket.send(JSON.stringify({ type: "move", gameBoard }));
    }

    public playAgain() {
        this.socket.send(JSON.stringify({ type: "play-again" }));
    }

    public reInitConn() {
        if (this.socket) {
            this.socket.close();
        }
        this.socket = new WebSocket('ws://34.82.227.188');
        // this.socket = new WebSocket('ws://127.0.0.1');
        this.socket.addEventListener('open', () => {
            console.log('Connected to WS Server');
            this.listeners.forEach(listener => listener({ type: "connected" }));
        });
        this.socket.addEventListener('message', (event) => {
            const message: any = JSON.parse(event.data);
            this.listeners.forEach(listener => listener(message));
        });
    }

    public onMessage(callback: (msg: Message) => void) {
        this.listeners.push(callback);
    }
}