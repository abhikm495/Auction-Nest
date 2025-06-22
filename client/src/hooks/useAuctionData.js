import { useEffect, useState, useRef } from "react";
import { useSocket } from "./useSocket";

export const useAuctionSocket = (auctionId) => {
  const { socket, isConnected, connectionError, isGuest } = useSocket();
  const [watchCount, setWatchCount] = useState(0);
  const [authError, setAuthError] = useState(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!socket || !auctionId || !isConnected) {
      return;
    }

    // Prevent duplicate joins
    if (hasJoinedRef.current) {
      return;
    }

    console.log('Joining auction:', auctionId);
    socket.emit('joinAuction', auctionId);
    hasJoinedRef.current = true;

    // Listen for watcher count updates
    const handleWatcherCount = (data) => {
      console.log('Received watcher count:', data);
      if (data.auctionId === auctionId) {
        setWatchCount(data.count);
      }
    };

    // Listen for bid errors (like authentication required)
    const handleBidError = (error) => {
      console.error('Bid error received:', error);
      setAuthError(error);
      
      if (error.requiresAuth) {
        // You can handle this in the component that uses this hook
        console.log('Authentication required for bidding');
      }
    };

    socket.on('watcherCount', handleWatcherCount);
    socket.on('bidError', handleBidError);

    // Get initial watch count
    socket.emit('checkWatching', auctionId, (response) => {
      console.log('Initial watch count:', response);
      if (response && typeof response.count === 'number') {
        setWatchCount(response.count);
      }
    });

    // Cleanup function
    return () => {
      console.log('Leaving auction:', auctionId);
      socket.off('watcherCount', handleWatcherCount);
      socket.off('bidError', handleBidError);
      
      if (hasJoinedRef.current) {
        socket.emit('leaveAuction', auctionId);
        hasJoinedRef.current = false;
      }
    };
  }, [socket, auctionId, isConnected]);

  // Reset when auctionId changes
  useEffect(() => {
    hasJoinedRef.current = false;
    setWatchCount(0);
    setAuthError(null);
  }, [auctionId]);

  const placeBid = (bidData) => {
    if (isGuest) {
      console.log('Guest user attempting to bid - should redirect to login');
      setAuthError({
        message: 'You must be logged in to place bids',
        requiresAuth: true
      });
      return false;
    }

    if (socket && isConnected) {
      socket.emit('placeBid', bidData);
      return true;
    } else {
      console.error('Socket not connected, cannot place bid');
      return false;
    }
  };

  return {
    socket,
    isConnected,
    connectionError,
    placeBid,
    watchCount,
    isGuest,
    authError,
    clearAuthError: () => setAuthError(null)
  };
};