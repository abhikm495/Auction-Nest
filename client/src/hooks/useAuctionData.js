import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";

export const useAuctionSocket = (auctionId) => {
    const { socket, isConnected, connectionError } = useSocket();
    const [auctionUsers, setAuctionUsers] = useState(0);
    const [hasJoinedAuction, setHasJoinedAuction] = useState(false);
  
    useEffect(() => {
      if (!socket || !auctionId || !isConnected || hasJoinedAuction) {
        return;
      }
        
      // Join auction when component mounts
      socket.emit('joinAuction', auctionId);
      setHasJoinedAuction(true);
  
      // Track users joining/leaving
      const handleUserJoined = (data) => {
        setAuctionUsers(prev => prev + 1);
      };
  
      const handleUserLeft = (data) => {
        setAuctionUsers(prev => Math.max(0, prev - 1));
      };
  
      socket.on('userJoined', handleUserJoined);
      socket.on('userLeft', handleUserLeft);
  
      // Cleanup
      return () => {
        socket.off('userJoined', handleUserJoined);
        socket.off('userLeft', handleUserLeft);
        
        if (hasJoinedAuction) {
          socket.emit('leaveAuction', auctionId);
          setHasJoinedAuction(false);
        }
      };
    }, [socket, auctionId, isConnected, hasJoinedAuction]);

    // Reset hasJoinedAuction when auctionId changes
    useEffect(() => {
      setHasJoinedAuction(false);
    }, [auctionId]);
  
    const placeBid = (bidData) => {
      if (socket && isConnected) {
        socket.emit('placeBid', bidData);
      } else {
        console.error('Socket not connected, cannot place bid');
      }
    };
  
    const sendTypingStatus = (isTyping) => {
      if (socket && isConnected) {
        socket.emit('typing', { auctionId, isTyping });
      }
    };
  
    return {
      socket,
      isConnected,
      connectionError,
      auctionUsers,
      placeBid,
      sendTypingStatus
    };
  };