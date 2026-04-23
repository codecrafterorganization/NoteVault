import { io } from 'socket.io-client';

// Singleton socket instance - shared across all Battle Mode components
export const socket = io('http://localhost:5000', {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
