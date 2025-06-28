import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, ChevronDown } from "lucide-react";
import { getAuctions } from "../../api/auction";
import { useNavigate } from "react-router-dom";

const LSearchBar = ({  
  initialValue = "",
  placeholder = "Search for antiques, art, collectibles..." ,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef(null);
  const searchContainerRef = useRef(null); // Added this ref to the container
  const inputRef = useRef(null);
  const navigate = useNavigate()

  // Debounce effect for search term
  useEffect(() => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(localSearchTerm);
    }, 200);

    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localSearchTerm]);

  // Search suggestions API call (now calls by default)
  const { data: searchResponse, isLoading: isSearchLoading } = useQuery({
    queryKey: ["searchSuggestions", debouncedSearchTerm],
    queryFn: () => getAuctions({
      ...queryParams,
      search_text: debouncedSearchTerm.trim(),
      page_size: 20,
      page_no: 1,
    }),
    // enabled: isDropdownOpen, // Removed the search term condition - now calls API even with empty search
    staleTime: 30 * 1000,
  });

  // Extract search results
  const searchResults = searchResponse?.data || [];

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setSelectedIndex(-1);
    
    // Always open dropdown when typing (even if empty)
    setIsDropdownOpen(true);
    
    // Clear debounced term immediately when input is empty
    if (!value.trim()) {
      setDebouncedSearchTerm("");
    }
  };

  // Handle search execution
  const executeSearch = (searchValue = localSearchTerm) => {
    const trimmedValue = searchValue.trim();
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    navigate(`/auction?search=${trimmedValue}`);
    // Clear any pending debounced call and immediately set debounced term
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setDebouncedSearchTerm(trimmedValue);
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        // Select highlighted item
        handleItemSelect(searchResults[selectedIndex]);
      } else {
        // Execute search with current input
        executeSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  // Handle dropdown item selection
  const handleItemSelect = (e,item) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/auction?search=${item.itemName}`);

  };


  // Clear search
  const clearSearch = () => {
    setLocalSearchTerm("");
    setDebouncedSearchTerm("");
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    
    // Clear any pending debounced call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  // Handle search icon click
  const handleSearchClick = () => {
    executeSearch();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update local search term when initialValue changes
  useEffect(() => {
    setLocalSearchTerm(initialValue);
  }, [initialValue]);

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <div className="relative group" ref={searchContainerRef}>
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={localSearchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Always open dropdown on focus (even if empty)
            setIsDropdownOpen(true);
          }}
          className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-lg"
          autoComplete="off"
        />

        {/* Right Side Buttons */}
        <button 
          onClick={handleSearchClick}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          Search
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {isSearchLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Loading auctions...</span>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-2">
                {searchResults.map((item, index) => (
                  <button
                    key={item._id}
                    onClick={(e) => handleItemSelect(e,item)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.itemPhoto || "https://picsum.photos/400/300"}
                          alt={item.itemName}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Item Name */}
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {item.itemName}
                            </p>

                            {/* Category and Seller */}
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.itemCategory?.name || 'No Category'}
                              </span>
                              <span className="text-xs text-gray-500">
                                by {item.seller?.name || 'Unknown Seller'}
                              </span>
                            </div>
                          </div>

                          {/* Current Price */}
                          <div className="flex-shrink-0 text-right ml-3">
                            <p className="text-sm font-bold text-green-600">
                              ${item.currentPrice?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>
                  {localSearchTerm.trim() 
                    ? `No auctions found for "${localSearchTerm}"` 
                    : "No auctions available"
                  }
                </p>
                {localSearchTerm.trim() && (
                  <button
                    onClick={() => executeSearch()}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Search anyway
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LSearchBar;