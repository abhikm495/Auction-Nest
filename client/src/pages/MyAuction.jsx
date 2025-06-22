import { useEffect, useState, React, useMemo } from "react";
import AuctionCard from "../components/AuctionCard";
import { useQuery } from "@tanstack/react-query";
import { getMyAuctions } from "../api/auction";
import LoadingScreen from "../components/LoadingScreen";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

export const MyAuction = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["myauctions"],
    queryFn: getMyAuctions,
    staleTime: 30 * 1000,
  });

  const categories = useMemo(() => {
    if (!data) return ["all"];
    return [
      "all",
      ...new Set(data.map((auction) => auction.itemCategory)),
    ];
  }, [data]);

  const filteredAndSortedAuctions = useMemo(() => {
    if (!data) return [];
    
    let filtered = data;
    
    // Filter by category
    if (filter !== "all") {
      filtered = filtered.filter((auction) => auction.itemCategory === filter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((auction) => 
        auction.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.itemCategory?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort auctions
    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "priceHigh":
        return filtered.sort((a, b) => (b.currentBid || b.startingBid) - (a.currentBid || a.startingBid));
      case "priceLow":
        return filtered.sort((a, b) => (a.currentBid || a.startingBid) - (b.currentBid || b.startingBid));
      case "endingSoon":
        return filtered.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
      default:
        return filtered;
    }
  }, [data, filter, searchTerm, sortBy]);

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load your auctions</h3>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Auctions</h1>
              <p className="text-gray-600">Manage and track your auction listings</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid" 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search your auctions by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filters and Sort Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            {/* Category Filters */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      filter === category
                        ? "bg-blue-600 text-white shadow-lg transform scale-105"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Controls */}
            <div className="lg:ml-6">
              <label className="text-sm font-medium text-gray-700 block mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priceHigh">Highest Price</option>
                <option value="priceLow">Lowest Price</option>
                <option value="endingSoon">Ending Soon</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-xl shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {filter === "all" ? "All My Auctions" : `My ${filter.charAt(0).toUpperCase() + filter.slice(1)} Auctions`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredAndSortedAuctions.length} {filteredAndSortedAuctions.length === 1 ? 'auction' : 'auctions'} found
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
          
          {/* Clear Filters Button */}
          {(filter !== "all" || searchTerm) && (
            <button
              onClick={() => {
                setFilter("all");
                setSearchTerm("");
              }}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results */}
        {filteredAndSortedAuctions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No auctions found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No auctions match your search "${searchTerm}"`
                : filter === "all"
                ? "You haven't created any auctions yet"
                : `No auctions found in the ${filter} category`
              }
            </p>
            {(filter !== "all" || searchTerm) && (
              <button
                onClick={() => {
                  setFilter("all");
                  setSearchTerm("");
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show All My Auctions
              </button>
            )}
          </div>
        ) : (
          <div className={`
            ${viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }
          `}>
            {filteredAndSortedAuctions.map((auction, index) => (
              <div
                key={auction._id}
                className="transform transition-all duration-300 hover:scale-105"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards"
                }}
              >
                <AuctionCard 
                  auction={auction} 
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (if pagination is needed) */}
        {filteredAndSortedAuctions.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Showing all {filteredAndSortedAuctions.length} of your auctions
            </p>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};