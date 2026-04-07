import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  setUserOnline(userId) {
    if (this.socket) {
      this.socket.emit('user-online', userId);
    }
  }

  joinChat(userId) {
    if (this.socket) {
      this.socket.emit('join-chat', userId);
    }
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('send-message', data);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive-message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message-sent', callback);
    }
  }

  onUserStatusChange(callback) {
    if (this.socket) {
      this.socket.on('user-status-change', callback);
    }
  }
}

const socketInstance = new SocketService();
export default socketInstance;
