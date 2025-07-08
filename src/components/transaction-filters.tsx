"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Search, Filter, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  availableCategories: string[];
  onReset: () => void;
  suggestions: string[];
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  selectedType,
  onTypeChange,
  availableCategories,
  onReset,
  suggestions
}: TransactionFiltersProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    if (value.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedType !== "all" || searchTerm.length > 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search with autocomplete */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par description, client, montant..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchTerm.length > 0 && filteredSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay to allow click on suggestions
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    onSearchChange("");
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Autocomplete suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto"
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Type filter */}
          <div className="flex gap-2">
            {["all", "income", "expense"].map((type) => (
              <motion.div key={type} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTypeChange(type)}
                  className={`${
                    selectedType === type
                      ? type === "income"
                        ? "bg-green-600 hover:bg-green-700"
                        : type === "expense"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }`}
                >
                  {type === "all" ? "Tous" : type === "income" ? "Revenus" : "Dépenses"}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Category chips */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Catégories</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Réinitialiser
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <motion.div
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => onCategoryToggle(category)}
                    >
                      {category}
                      {isSelected && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Active filters summary */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-gray-200"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Filtres actifs:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Recherche: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedType !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Type: {selectedType === "income" ? "Revenus" : "Dépenses"}
                    </Badge>
                  )}
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedCategories.length} catégorie{selectedCategories.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}