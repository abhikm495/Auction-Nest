import React from "react"
import AuctionCard from "../components/AuctionCard.jsx";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { dashboardStats } from "../api/auction.js";
import LoadingScreen from "../components/LoadingScreen.jsx";

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: () => dashboardStats(),
    staleTime: 30 * 1000,
  });

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const isAuthenticated = data.isAuthenticated;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isAuthenticated ? "Welcome back!" : "Auction Dashboard"}
              </h1>
              <p className="text-gray-600">
                {isAuthenticated 
                  ? "Manage your auctions and discover new opportunities" 
                  : "Discover amazing auctions and place your bids"
                }
              </p>
            </div>
            {isAuthenticated && (
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Link to="/create">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Auction</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Auctions */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Total Auctions
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {data.totalAuctions?.toLocaleString() || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Auctions */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Active Auctions
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  {data.activeAuctions?.toLocaleString() || 0}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Live Now</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* User Auctions */}
          {isAuthenticated && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Your Auctions
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {data.userAuctionCount?.toLocaleString() || 0}
                  </p>
                  <Link to="/myauction" className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block">
                    Manage all →
                  </Link>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg mb-12 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to start bidding?</h3>
                <p className="text-blue-100">Join thousands of users buying and selling unique items</p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Link to="/login">
                  <button className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-400 transition-colors font-medium">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* All Auctions Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Latest Auctions</h2>
              <p className="text-gray-600 text-sm">Discover the newest items up for auction</p>
            </div>
            <Link
              to="/auction"
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center space-x-1"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {data.latestAuctions?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No auctions available</h3>
              <p className="text-gray-500 mb-4">Be the first to create an auction and start selling!</p>
              {isAuthenticated && (
                <Link to="/create">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    Create First Auction
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.latestAuctions?.map((auction, index) => (
                <div
                  key={auction._id}
                  className="transform transition-all duration-300 hover:scale-105"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards"
                  }}
                >
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Auctions Section */}
        {isAuthenticated && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Recent Auctions</h2>
                <p className="text-gray-600 text-sm">Manage and track your auction performance</p>
              </div>
              <Link
                to="/myauction"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center space-x-1"
              >
                <span>Manage All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {data.latestUserAuctions?.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your auction journey</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't created any auctions yet. Create your first auction and start selling to thousands of potential buyers.
                </p>
                <Link to="/create">
                  <button className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium">
                    Create Your First Auction
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.latestUserAuctions?.map((auction, index) => (
                  <div
                    key={auction._id}
                    className="transform transition-all duration-300 hover:scale-105"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards"
                    }}
                  >
                    <AuctionCard auction={auction} />
                  </div>
                ))}
              </div>
            )}
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

export default Dashboard;