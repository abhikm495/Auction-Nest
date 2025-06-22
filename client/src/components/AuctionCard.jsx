import React, { useState, useEffect } from "react";
import { Eye, Clock, Users, TrendingUp, Star, Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export default function AuctionCard({ auction }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate time left with more precision
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(auction.endTime || Date.now() + auction.timeLeft).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft("Ended");
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [auction.timeLeft, auction.endTime]);

  const currentPrice = auction.currentPrice || auction.startingPrice || 0;
  const bidsCount = auction.bidsCount || 0;
  const isEnded = timeLeft === "Ended";

  const navigate = useNavigate()

  const handleButtonClick = (id) =>{
    navigate(`/auction/${id}`)
  }

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden bg-gray-50">
        <img
          src={auction.itemPhoto || "https://picsum.photos/400/300"}
          alt={auction.itemName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700">
            {auction.itemCategory}
          </span>
        </div>

        {/* Like button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110"
        >
          <Heart 
            className={`w-4 h-4 transition-colors duration-200 ${
              isLiked ? 'text-red-500 fill-current' : 'text-gray-600'
            }`} 
          />
        </button>

        {/* Status badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isEnded 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isEnded ? 'bg-red-500' : 'bg-green-500'
            } ${!isEnded ? 'animate-pulse' : ''}`}></div>
            {isEnded ? 'Ended' : 'Live'}
          </span>
        </div>

        {/* Quick view overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-transform duration-200 hover:scale-105">
            <Eye className="w-4 h-4" />
            Quick View
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
          {auction.itemName}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {auction.itemDescription}
        </p>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">
              ${currentPrice.toLocaleString()}
            </span>
            {auction.startingPrice && currentPrice > auction.startingPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${auction.startingPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Price increase indicator */}
          {auction.startingPrice && currentPrice > auction.startingPrice && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">
                +${(currentPrice - auction.startingPrice).toLocaleString()} from starting price
              </span>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Bids</span>
            </div>
            <span className="font-semibold text-gray-900">{bidsCount}</span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Time Left</span>
            </div>
            <span className={`font-semibold ${isEnded ? 'text-red-600' : 'text-orange-600'}`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {(auction?.sellerName || auction?.seller?.name || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {auction?.sellerName || auction?.seller?.name || 'Unknown Seller'}
            </p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-500">4.8 (124 reviews)</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button onClick={()=>handleButtonClick(auction._id)} className="group/btn w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
          <span className="flex items-center justify-center gap-2">
            {isEnded ? (
              <>
                <Eye className="w-4 h-4" />
                View Results
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Place Bid
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
              </>
            )}
          </span>
        </button>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}