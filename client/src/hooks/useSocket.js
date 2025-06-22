import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize socket regardless of authentication status
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
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to socket server with ID:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Determine if user is guest based on authentication state
      const isUserGuest = !user;
      setIsGuest(isUserGuest);
      console.log('User is guest:', isUserGuest);
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
      
      if (error.requiresAuth) {
        // Handle authentication required error
        console.log('Authentication required for bidding');
        // You can emit a custom event or use a callback to handle this
        // For example, redirect to login
      }
    });

    newSocket.on('userJoined', (data) => {
      console.log('User joined auction:', data.userName);
    });

    newSocket.on('userLeft', (data) => {
      console.log('User left auction:', data.userName);
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setConnectionError(null);
      setIsGuest(false);
    };
  }, []); // Remove user dependency to maintain connection regardless of auth status

  // Update guest status when user auth state changes
  useEffect(() => {
    const isUserGuest = !user;
    setIsGuest(isUserGuest);
  }, [user]);

  return {
    socket,
    isConnected,
    connectionError,
    isGuest
  };
};