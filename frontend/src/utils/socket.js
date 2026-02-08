import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let socket = null;

export const initSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✓ Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('✗ Disconnected from server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized. Call initSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
