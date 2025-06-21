import { useEffect, useState, useRef } from "react";
import { useSocket } from "./useSocket";

export const useAuctionSocket = (auctionId) => {
  const { socket, isConnected, connectionError } = useSocket();
  const [watchCount, setWatchCount] = useState(0);
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

    socket.on('watcherCount', handleWatcherCount);

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
  }, [auctionId]);

  const placeBid = (bidData) => {
    if (socket && isConnected) {
      socket.emit('placeBid', bidData);
    } else {
      console.error('Socket not connected, cannot place bid');
    }
  };

  return {
    socket,
    isConnected,
    connectionError,
    placeBid,
    watchCount
  };
};