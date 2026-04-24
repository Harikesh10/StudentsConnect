import io from 'socket.io-client';

const SOCKET_URL = 'https://students-connect-9ywv.onrender.com';


class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket && this.socket.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

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
      this.socket = null;
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

  // Typing indicators
  sendTyping(data) {
    if (this.socket) {
      this.socket.emit('typing', data);
    }
  }

  sendStopTyping(data) {
    if (this.socket) {
      this.socket.emit('stop-typing', data);
    }
  }

  // Event listeners with proper cleanup support
  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.off('receive-message'); // Remove previous listener
      this.socket.on('receive-message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.off('message-sent'); // Remove previous listener
      this.socket.on('message-sent', callback);
    }
  }

  onUserStatusChange(callback) {
    if (this.socket) {
      this.socket.off('user-status-change');
      this.socket.on('user-status-change', callback);
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.off('user-typing');
      this.socket.on('user-typing', callback);
    }
  }

  onStopTyping(callback) {
    if (this.socket) {
      this.socket.off('user-stop-typing');
      this.socket.on('user-stop-typing', callback);
    }
  }

  // Cleanup all chat-related listeners
  removeAllChatListeners() {
    if (this.socket) {
      this.socket.off('receive-message');
      this.socket.off('message-sent');
      this.socket.off('user-typing');
      this.socket.off('user-stop-typing');
      this.socket.off('user-status-change');
    }
  }
}

const socketInstance = new SocketService();
export default socketInstance;
