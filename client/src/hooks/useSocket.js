import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null); // Add state for socket
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Only initialize socket if user is authenticated
    if (user) {      
      // Determine socket URL based on environment
      const socketUrl = import.meta.env.VITE_API;
      
      // Initialize socket connection
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        extraHeaders: {
          // Add any additional headers if needed
        }
      });

      socketRef.current = newSocket;
      setSocket(newSocket); // Set socket in state to trigger re-renders

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to socket server with ID:', newSocket.id);
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        setIsConnected(false);
        
        // Auto-reconnect on certain disconnect reasons
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
        setConnectionError(error.message);
        
        if (error.message.includes('Authentication')) {
          console.error('Authentication failed - check if user is logged in');
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('Reconnected to socket server after', attemptNumber, 'attempts');
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('Reconnection failed:', error);
        setConnectionError(error.message);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        setConnectionError(error);
      });

      newSocket.on('bidError', (error) => {
        console.error('Bid error:', error);
        alert(error.message || 'Error processing bid');
      });

      newSocket.on('userJoined', (data) => {
        console.log('User joined auction:', data.userName);
      });

      newSocket.on('userLeft', (data) => {
        console.log('User left auction:', data.userName);
      });

      newSocket.on('userTyping', (data) => {
        console.log('User typing:', data.userName, data.isTyping);
      });

      // Cleanup function
      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setConnectionError(null);
      };
    } else {
      // If user logs out, disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setConnectionError(null);
      }
    }
  }, [user]);

  return {
    socket, // Return socket from state, not ref
    isConnected,
    connectionError
  };
};