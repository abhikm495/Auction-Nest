import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AuctionCard from "../components/AuctionCard";
import { useQuery } from "@tanstack/react-query";
import { getAuctions } from "../api/auction";
import LoadingScreen from "../components/LoadingScreen";
import { getCategories } from "../api/category";
import SearchBar from "../components/SearchBar";
import { Search, Grid, List, Filter} from "lucide-react";
import MobileFilterOverlay from "../components/AuctionList/MobileFilterOverlay";
import CategoryFilter from "../components/AuctionList/CategoryFilter";
import SortOptions from "../components/AuctionList/SortOptions";
import PriceRangeFilter from "../components/AuctionList/PriceRangeFilter";

// Memoized components to prevent unnecessary re-renders
const MemoizedAuctionCard = React.memo(AuctionCard);

// Pagination Component
const Pagination = ({ pagination, currentPage, onPageChange }) => {
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages || 1;
    const current = currentPage;
    const delta = 2;
    
    let pages = [];
    let start = Math.max(1, current - delta);
    let end = Math.min(totalPages, current + delta);
    
    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(totalPages, start + 4);
      } else if (end === totalPages) {
        start = Math.max(1, end - 4);
      }
    }
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (pagination.totalPages <= 1) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Showing {((currentPage - 1) * pagination.pageSize) + 1} to{' '}
          {Math.min(currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
          {pagination.totalItems} results
        </div>
        
        <div className="flex items-center space-x-1 flex-wrap justify-center">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              pagination.hasPrevPage
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            Previous
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : page === '...'
                  ? "text-gray-400 cursor-default"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              pagination.hasNextPage
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export const MyAuction = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const categories = searchParams.get('categories');
    return categories ? categories.split(',').filter(Boolean) : [];
  });
  
  const [searchTerm, setSearchTerm] = useState(() => {
    return searchParams.get('search') || '';
  });
  
  const [viewMode, setViewMode] = useState(() => {
    return searchParams.get('view') || 'grid';
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  });
  
  const [sortOptions, setSortOptions] = useState(() => {
    const sort = {};
    if (searchParams.get('sort_date')) sort.sort_date = searchParams.get('sort_date');
    if (searchParams.get('sort_price')) sort.sort_price = searchParams.get('sort_price');
    if (searchParams.get('sort_bids')) sort.sort_bids = searchParams.get('sort_bids');
    return sort;
  });
  
  const [priceRange, setPriceRange] = useState(() => {
    return {
      min: searchParams.get('min_price') || '',
      max: searchParams.get('max_price') || ''
    };
  });
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const pageSize = 100;

  // Function to update URL parameters
  const updateURLParams = useCallback((updates) => {
    setSearchParams(prevParams => {
      const newParams = new URLSearchParams(prevParams);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)) {
          newParams.delete(key);
        } else if (Array.isArray(value)) {
          newParams.set(key, value.join(','));
        } else {
          newParams.set(key, value.toString());
        }
      });
      
      return newParams;
    });
  }, [setSearchParams]);

  // Enhanced category toggle with URL sync
  const handleCategoryToggle = useCallback((categoryId) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];
      
      // Update URL
      updateURLParams({ 
        categories: newCategories.length > 0 ? newCategories : null,
        page: null // Reset page when filters change
      });
      
      return newCategories;
    });
  }, [updateURLParams]);

  // Enhanced search handler with URL sync
  const handleSearchChange = useCallback((searchText) => {
    setSearchTerm(searchText);
    updateURLParams({ 
      search: searchText || null,
      page: null // Reset page when search changes
    });
  }, [updateURLParams]);

  // Enhanced view mode change with URL sync
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    updateURLParams({ view: mode });
  }, [updateURLParams]);

  // Enhanced page change with URL sync
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1) {
      setCurrentPage(newPage);
      updateURLParams({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [updateURLParams]);

  // Enhanced sort change with URL sync
  const handleSortChange = useCallback((newSortOptions) => {
    setSortOptions(newSortOptions);
    const sortUpdates = {
      sort_date: newSortOptions.sort_date || null,
      sort_price: newSortOptions.sort_price || null,
      sort_bids: newSortOptions.sort_bids || null,
      page: null // Reset page when sort changes
    };
    updateURLParams(sortUpdates);
  }, [updateURLParams]);

  // Enhanced price range change with URL sync
  const handlePriceRangeChange = useCallback((newPriceRange) => {
    setPriceRange(newPriceRange);
    updateURLParams({
      min_price: newPriceRange.min || null,
      max_price: newPriceRange.max || null,
      page: null // Reset page when price range changes
    });
  }, [updateURLParams]);

  // Enhanced clear filters with URL sync
  const handleClearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSearchTerm("");
    setSortOptions({});
    setPriceRange({ min: "", max: "" });
    setCurrentPage(1);
    
    // Clear all filter-related URL parameters
    updateURLParams({
      categories: null,
      search: null,
      sort_date: null,
      sort_price: null,
      sort_bids: null,
      min_price: null,
      max_price: null,
      page: null
    });
  }, [updateURLParams]);

  // Sync state with URL changes (for browser back/forward)
  useEffect(() => {
    const categories = searchParams.get('categories');
    const search = searchParams.get('search');
    const view = searchParams.get('view');
    const page = searchParams.get('page');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    
    if (categories !== null) {
      const categoryArray = categories ? categories.split(',').filter(Boolean) : [];
      setSelectedCategories(categoryArray);
    }
    
    if (search !== null) {
      setSearchTerm(search || '');
    }
    
    if (view !== null) {
      setViewMode(view || 'grid');
    }
    
    if (page !== null) {
      const pageNum = page ? parseInt(page, 10) : 1;
      setCurrentPage(pageNum);
    }
    
    if (minPrice !== null || maxPrice !== null) {
      setPriceRange({
        min: minPrice || '',
        max: maxPrice || ''
      });
    }
    
    // Handle sort options
    const sort = {};
    if (searchParams.get('sort_date')) sort.sort_date = searchParams.get('sort_date');
    if (searchParams.get('sort_price')) sort.sort_price = searchParams.get('sort_price');
    if (searchParams.get('sort_bids')) sort.sort_bids = searchParams.get('sort_bids');
    setSortOptions(sort);
  }, [searchParams]);

  // Build query parameters for API
  const queryParams = useMemo(() => {
    const params = {
      page_no: currentPage,
      page_size: pageSize,
      my_auction: 'true'
    };

    // Add search term
    if (searchTerm.trim()) {
      params.search_text = searchTerm.trim();
    }

    // Add multiple categories
    if (selectedCategories.length > 0) {
      params.categories = selectedCategories.join(',');
    }

    // Add price range
    if (priceRange.min) {
      params.min_price = parseFloat(priceRange.min);
    }
    if (priceRange.max) {
      params.max_price = parseFloat(priceRange.max);
    }

    // Add sort options
    if (sortOptions.sort_date) {
      params.sort_date = sortOptions.sort_date;
    }
    if (sortOptions.sort_price) {
      params.sort_price = sortOptions.sort_price;
    }
    if (sortOptions.sort_bids) {
      params.sort_bids = sortOptions.sort_bids;
    }

    return params;
  }, [currentPage, pageSize, searchTerm, selectedCategories, priceRange, sortOptions]);

  // Fetch auctions with API integration
  const { data: auctionResponse, isLoading: auctionDataLoading, error, isRefetching } = useQuery({
    queryKey: ["allAuction", queryParams],
    queryFn: () => getAuctions(queryParams),
    staleTime: 30 * 1000,
    keepPreviousData: true,
  });

  // Fetch categories for filter options
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 5 * 60 * 1000,
  });

  // Extract auction data from API response
  const auctionData = useMemo(() => {
    if (auctionResponse?.data && Array.isArray(auctionResponse.data)) {
      return auctionResponse.data;
    }
    return [];
  }, [auctionResponse]);

  // Extract pagination data from API response
  const pagination = useMemo(() => {
    if (auctionResponse?.pagination) {
      return auctionResponse.pagination;
    }
    return { 
      totalPages: 1, 
      currentPage: 1, 
      totalItems: auctionData.length,
      pageSize: pageSize,
      hasNextPage: false,
      hasPrevPage: false
    };
  }, [auctionResponse, auctionData.length, pageSize]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (searchTerm.trim()) count++;
    if (priceRange.min || priceRange.max) count++;
    if (Object.keys(sortOptions).length > 0) count++;
    return count;
  }, [selectedCategories, searchTerm, priceRange, sortOptions]);

  const sidebarContent = (
    <div className="space-y-6">
      {/* Clear Filters Button */}
      <button
        onClick={handleClearFilters}
        className="cursor-pointer w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-300 rounded-lg transition-colors"
        disabled={!activeFiltersCount}
      >
        Clear All Filters ({activeFiltersCount})
      </button>

      {/* Category Filter */}
      <CategoryFilter
        categories={categoriesData}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />

      {/* Sort Options */}
      <SortOptions
        sortOptions={sortOptions}
        onSortChange={handleSortChange}
      />

      {/* Price Range Filter */}
      <PriceRangeFilter
        priceRange={priceRange}
        onPriceRangeChange={handlePriceRangeChange}
      />
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load auctions</h3>
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Live Auctions</h1>
              <p className="text-sm sm:text-base text-gray-600">Discover unique items and place your bids</p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`cursor-pointer p-2 rounded-lg transition-colors ${
                  viewMode === "grid" 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => handleViewModeChange("list")}
                className={`cursor-pointer p-2 rounded-lg transition-colors ${
                  viewMode === "list" 
                    ? "bg-blue-600 text-white" 
                    : "bg-white text-gray-400 hover:text-gray-600"
                }`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <SearchBar 
              initialValue={searchTerm}
              onSearch={handleSearchChange}
              queryParams={queryParams}
            />
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters & Sort</span>
              </div>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm sticky top-8" style={{ height: 'calc(100vh - 6rem)' }}>
              {/* Sidebar Header */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Filters & Sort</h3>
              </div>
              
              {/* Scrollable Content */}
              <div className="overflow-y-auto p-6" style={{ height: 'calc(100% - 80px)' }}>
                {sidebarContent}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {pagination.totalItems} Auctions Found
                  </h2>
                  {searchTerm && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Results for "{searchTerm}"
                    </p>
                  )}
                  {isRefetching && (
                    <p className="text-xs sm:text-sm text-blue-600 mt-1">
                      Updating results...
                    </p>
                  )}
                </div>

                {activeFiltersCount > 0 && (
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium self-start sm:self-center">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                  </span>
                )}
              </div>
            </div>

            {/* Auction Grid/List */}
            {auctionDataLoading || isRefetching ? <LoadingScreen/> : auctionData.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  No auctions found
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">
                  Try adjusting your search or filters
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className={`
                ${viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6" 
                  : "space-y-3 sm:space-y-4"
                }
              `}>
                {auctionData.map((auction, index) => (
                  <div
                    key={auction._id}
                    className="w-full min-w-0 transform transition-all duration-300 hover:scale-105"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: "fadeInUp 0.6s ease-out forwards"
                    }}
                  >
                    <div className="w-full h-full">
                      <MemoizedAuctionCard auction={auction}  myAuction={true} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        <MobileFilterOverlay
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
        >
          {sidebarContent}
        </MobileFilterOverlay>
      </div>

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
        
        /* Hide scrollbar while keeping scroll functionality */
        .overflow-y-auto {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          display: none; /* WebKit */
        }
      `}</style>
    </div>
  );
};