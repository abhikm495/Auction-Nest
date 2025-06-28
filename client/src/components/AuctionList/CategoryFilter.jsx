import { Filter } from "lucide-react";
import React from "react"
const CategoryFilter = ({ categories, selectedCategories, onCategoryToggle }) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
        <Filter className="w-4 h-4 mr-2" />
        Categories
      </h3>
      <div className="space-y-2">
        {categories?.map((category) => {
          const isSelected = selectedCategories.includes(category._id);
          return (
            <label
              key={category._id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onCategoryToggle(category._id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter