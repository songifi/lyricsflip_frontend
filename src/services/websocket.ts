import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  connect() {
    this.socket = io(this.serverUrl);

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('player_join', (data: any) => {
      console.log('Player joined: ', data);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Disconnected from WebSocket server');
    }
  }

  emitPlayerJoin(playerData: any) {
    if (this.socket) {
      this.socket.emit('player_join', playerData);
    }
  }
}

export const webSocketService = new WebSocketService('ws://localhost:3000');
