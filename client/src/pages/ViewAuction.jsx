import { useRef, useEffect, React, useState } from "react";
import { useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { placeBid, viewAuction } from "../api/auction.js";
import { useSelector } from "react-redux";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { useAuctionSocket } from "../hooks/useAuctionData.js";
import toast, { Toaster } from 'react-hot-toast';
import { 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Eye, 
  Gavel,
  User,
  Tag,
  Calendar,
  DollarSign,
  Zap,
  Crown,
  Timer,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ViewAuction = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const inputRef = useRef();
  const { socket, isConnected, watchCount } = useAuctionSocket(id);
  const [isBidHistoryOpen, setIsBidHistoryOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["viewAuctions", id],
    queryFn: () => viewAuction(id),
    staleTime: 30 * 1000,
    placeholderData: () => undefined,
  });

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('joinAuction', id);

    const handleNewBid = (bidData) => {
      console.log("current user id ", user.user._id);
      console.log("new bidder id and name, bidAmount", bidData.bidder._id, bidData.bidder.name, bidData.bidAmount);
      
      if (bidData.bidder._id === user.user._id) {
        toast((t) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Bid Placed Successfully!</p>
              <p className="text-sm text-emerald-100">You're now the highest bidder! 🎉</p>
            </div>
          </div>
        ), {
          duration: 4000,
          position: 'top-right',
          style: {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            color: 'white',
            border: '1px solid #10b981',
            borderLeft: '4px solid #10b981',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '20px',
            backdropFilter: 'blur(20px)',
          },
        });
      } else {
        toast((t) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">{bidData.bidder.name} place a bid!</p>
              <p className="text-sm text-slate-600">New highest bid: <span className="font-semibold text-orange-600">${bidData.bidAmount}</span></p>
            </div>
          </div>
        ), {
          duration: 5000,
          position: 'top-right',
          style: {
            background: 'rgba(255, 255, 255, 0.98)',
            color: '#1f2937',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            borderLeft: '4px solid #f97316',
            boxShadow: '0 20px 40px rgba(249, 115, 22, 0.15), 0 0 0 1px rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '20px',
          },
        });
      }
      
      queryClient.setQueryData(["viewAuctions", id], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          currentPrice: bidData.bidAmount,
          bids: [bidData, ...oldData.bids]
        };
      });

      if (bidData.bidder._id === user.user._id && inputRef.current) {
        inputRef.current.value = "";
      }
    };

    const handleAuctionUpdate = (updateData) => {
      queryClient.setQueryData(["viewAuctions", id], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          currentPrice: updateData.currentPrice,
          totalBids: updateData.totalBids
        };
      });
    };

    const handleAuctionEnd = (auctionData) => {
      toast((t) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Timer className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg">Auction Ended!</p>
            <p className="text-sm text-red-100">Bidding has closed for this item</p>
          </div>
        </div>
      ), {
        duration: 6000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          boxShadow: '0 25px 50px rgba(220, 38, 38, 0.3)',
          borderRadius: '16px',
          padding: '24px',
        },
      });

      queryClient.setQueryData(["viewAuctions", id], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          itemEndDate: auctionData.endDate,
          winner: auctionData.winner
        };
      });
    };

    socket.on('newBid', handleNewBid);
    socket.on('auctionUpdate', handleAuctionUpdate);
    socket.on('auctionEnded', handleAuctionEnd);

    return () => {
      socket.off('newBid', handleNewBid);
      socket.off('auctionUpdate', handleAuctionUpdate);
      socket.off('auctionEnded', handleAuctionEnd);
      socket.emit('leaveAuction', id);
    };
  }, [socket, id, queryClient, user.user._id]);

  const placeBidMutate = useMutation({
    mutationFn: ({ bidAmount, id }) => placeBid({ bidAmount, id }),
    onSuccess: () => {      
      if (inputRef.current) inputRef.current.value = "";
    },
    onError: (error) => {
      console.log("Error: ", error.message);
      
      toast.error(error.message || 'Failed to place bid. Please try again.', {
        duration: 4000,
        position: 'top-right',
        style: {
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 25px rgba(220, 38, 38, 0.3)',
        },
        icon: <AlertCircle className="w-5 h-5" />,
      });
    },
  });

  if (isLoading) return <LoadingScreen />;

  const handleBidSubmit = (e) => {
    e.preventDefault();
    let bidAmount = e.target.bidAmount.value.trim();
    placeBidMutate.mutate({ bidAmount, id });
  };

  const daysLeft = Math.ceil(
    Math.max(0, new Date(data.itemEndDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isActive = Math.max(0, new Date(data.itemEndDate) - new Date()) > 0;

  // Enhanced watch count component
  const WatchCountDisplay = ({ watchCount, isActive }) => (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="relative">
        <Eye className="w-5 h-5 text-blue-600" />
        {isActive && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-blue-900 transition-all duration-300">
          {watchCount}
        </span>
        <span className="text-sm text-blue-700 font-medium">watching</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      <Toaster />
      
      {/* Bid History Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-96 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
        isBidHistoryOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-slate-600 to-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Bid History</h2>
              {isActive && (
                <p className="text-xs text-slate-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  Live updates
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsBidHistoryOpen(false)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="h-full overflow-y-auto pb-20">
          {data.bids.length === 0 ? (
            <div className="p-8 text-center">
              <div className="p-6 bg-slate-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Gavel className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-lg text-slate-500 font-medium">No bids yet</p>
              <p className="text-slate-400 mt-1 text-sm">Be the first to place a bid!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {data.bids.map((bid, index) => (
                <div
                  key={`${bid.bidder?._id}-${bid.bidTime}-${index}`}
                  className={`p-4 transition-all duration-300 hover:bg-slate-50/50 ${
                    index === 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        index === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-200'
                      }`}>
                        {index === 0 ? (
                          <Crown className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-2">
                          {bid.bidder?.name}
                          {bid.bidder?._id === user.user._id && (
                            <span className="text-xs text-indigo-600 font-medium bg-indigo-100 px-2 py-1 rounded-full">You</span>
                          )}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(bid.bidTime).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(bid.bidTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        index === 0 ? 'text-green-600' : 'text-slate-700'
                      }`}>
                        ${bid.bidAmount}
                      </p>
                      {index === 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
                          <Crown className="w-2.5 h-2.5" />
                          Highest
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsBidHistoryOpen(!isBidHistoryOpen)}
        className={`fixed top-1/2 transform -translate-y-1/2 z-40 bg-gradient-to-r from-slate-600 to-slate-700 text-white p-3 rounded-r-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-slate-700 hover:to-slate-800 ${
          isBidHistoryOpen ? 'left-96' : 'left-0'
        }`}
      >
        <div className="flex items-center gap-2">
          {isBidHistoryOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <>
              <Gavel className="w-5 h-5" />
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </div>
        {!isBidHistoryOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {data?.bids?.length || 0}
          </div>
        )}
      </button>

      {/* Overlay */}
      {isBidHistoryOpen && (
        <div
          className="fixed inset-0 bg-black/20  z-40"
          onClick={() => setIsBidHistoryOpen(false)}
        />
      )}
      
      {/* Connection status bar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-3 text-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="text-slate-300">Socket: {socket?.id?.slice(0, 8) || 'None'}</div>
          </div>
          <WatchCountDisplay watchCount={watchCount} isActive={isActive} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Enhanced Image Section */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="aspect-square bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 group-hover:shadow-3xl">
                <img
                  src={data.itemPhoto || "https://picsum.photos/601"}
                  alt={data.itemName}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Details Section */}
          <div className="space-y-8">
            {/* Header with badges and status */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 px-4 py-2 rounded-full text-sm font-semibold border border-slate-300 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {data.itemCategory}
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                      : "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-white'}`}></div>
                  {isActive ? "Active" : "Ended"}
                </span>
                {isActive && (
                  <span className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    <Zap className="w-4 h-4" />
                    LIVE AUCTION
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                {data.itemName}
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200">
                {data.itemDescription}
              </p>
            </div>

            {/* Enhanced Pricing Card */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-100/30 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-slate-600" />
                      <p className="text-sm font-medium text-slate-600">Starting Price</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      ${data.startingPrice}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 relative">
                    <div className="absolute -top-2 -right-2">
                      <Crown className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-green-700">Current Price</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600 transition-all duration-300">
                      ${data.currentPrice}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Gavel className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-600">Total Bids</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {data.bids.length}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <p className="text-sm font-medium text-orange-600">Time Left</p>
                    </div>
                    <p className={`text-2xl font-bold ${isActive ? "text-orange-600" : "text-slate-500"}`}>
                      {isActive ? `${daysLeft} days` : "Ended"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Bid Form */}
            {data.seller._id != user.user._id && isActive && (
              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-100/30 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full">
                      <Gavel className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Place Your Bid</h3>
                  </div>
                  
                  <form onSubmit={handleBidSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="bidAmount" className="block text-sm font-semibold text-slate-700 mb-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Bid Amount
                        </div>
                        <span className="text-xs text-slate-500 font-normal">
                          Range: ${data.currentPrice + 1} - ${data.currentPrice + 10}
                        </span>
                      </label>
                      <div className="relative">
          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5 z-10 pointer-events-none" />
          <input
          min={data.currentPrice + 1}
          max={data.currentPrice + 10}
          id="bidAmount"
            ref={inputRef}
            type="number"
            className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-lg font-semibold bg-white shadow-sm"
            placeholder="Enter bid amount"
          />
        </div>
                    </div>
                    <button
                    
                      type="submit"
                      disabled={placeBidMutate.isPending}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                    >
                      {placeBidMutate.isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Placing Bid...
                        </>
                      ) : (
                        <>
                          <Gavel className="w-5 h-5" />
                          Place Bid
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Enhanced Seller Info */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Seller</h3>
                  <p className="text-xl font-bold text-slate-700">{data.seller.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};