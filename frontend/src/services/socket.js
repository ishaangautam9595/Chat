import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('reconnect', () => {
  console.log('Reconnected to server');
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection failed:', error);
});

export default socket;