import { ChevronDown, ChevronUp, SortAsc } from "lucide-react";
import React, { useState } from "react"
const SortOptions = ({ sortOptions, onSortChange }) => {
    const [isExpanded, setIsExpanded] = useState(true);
  
    const sortCategories = [
      {
        key: "sort_date",
        label: "Date",
        icon: "📅",
        options: [
          { value: "newest", label: "Newest First" },
          { value: "oldest", label: "Oldest First" }
        ]
      },
      {
        key: "sort_price",
        label: "Price",
        icon: "💰",
        options: [
          { value: "priceHigh", label: "High to Low" },
          { value: "priceLow", label: "Low to High" }
        ]
      },
      {
        key: "sort_bids",
        label: "Bids",
        icon: "🔨",
        options: [
          { value: "bidCountHigh", label: "Most Bids" },
          { value: "bidCountLow", label: "Least Bids" }
        ]
      }
    ];
  
    const handleSortChange = (category, value) => {
      const newSortOptions = { ...sortOptions };
      
      if (newSortOptions[category] === value) {
        // If same option is selected, deselect it
        delete newSortOptions[category];
      } else {
        // Select the new option for this category
        newSortOptions[category] = value;
      }
      
      onSortChange(newSortOptions);
    };
  
    const getActiveSortCount = () => {
      return Object.keys(sortOptions).length;
    };
  
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors"
        >
          <span className="flex items-center">
            <SortAsc className="w-4 h-4 mr-2" />
            Sort By
            {getActiveSortCount() > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
                {getActiveSortCount()}
              </span>
            )}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {isExpanded && (
          <div className="space-y-4">
            {sortCategories.map((category) => {
              const activeValue = sortOptions[category.key];
              
              return (
                <div key={category.key} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      {category.label}
                    </span>
                    {activeValue && (
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {category.options.map((option) => {
                      const isSelected = sortOptions[category.key] === option.value;
                      
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(category.key, option.value)}
                          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* {getActiveSortCount() > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs font-medium text-blue-800 mb-2">
                  Active Sorts:
                </div>
                <div className="space-y-1">
                  {Object.entries(sortOptions).map(([key, value]) => {
                    const category = sortCategories.find(cat => cat.key === key);
                    const option = category?.options.find(opt => opt.value === value);
                    
                    return category && option ? (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="flex items-center text-blue-700">
                          <span className="mr-1">{category.icon}</span>
                          {category.label}: {option.label}
                        </span>
                        <button
                          onClick={() => handleSortChange(key, value)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
                <button
                  onClick={() => onSortChange({})}
                  className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All Sorts
                </button>
              </div>
            )} */}
          </div>
        )}
      </div>
    );
  };

  export default SortOptions