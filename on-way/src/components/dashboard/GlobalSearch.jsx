 "use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import {
  FiSearch,
  FiX,
  FiUser,
  FiTruck,
  FiMapPin,
  FiStar,
  FiLoader,
} from "react-icons/fi";

/**
 * Global Smart Search Component
 * Searches across multiple collections with real-time suggestions
 */
export default function GlobalSearch() {
  const router = useRouter();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  const {
    query,
    results,
    loading,
    error,
    totalResults,
    isOpen,
    handleQueryChange,
    clearSearch,
    closeDropdown,
  } = useGlobalSearch(400);

  /**
   * Get icon for category
   */
  const getCategoryIcon = (type) => {
    switch (type) {
      case "user":
        return <FiUser className="text-blue-500" />;
      case "rider":
        return <FiTruck className="text-green-500" />;
      case "booking":
        return <FiMapPin className="text-purple-500" />;
      case "review":
        return <FiStar className="text-yellow-500" />;
      default:
        return <FiSearch className="text-gray-500" />;
    }
  };

  /**
   * Handle result click
   */
  const handleResultClick = (result) => {
    router.push(result.route);
    clearSearch();
  };

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      clearSearch();
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search users, riders, bookings..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
        >
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <FiLoader className="animate-spin text-blue-500 text-2xl" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="px-4 py-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && totalResults === 0 && query && (
            <div className="px-4 py-8 text-center">
              <FiSearch className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-600">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">
                Try different keywords
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && totalResults > 0 && (
            <div className="py-2">
              {/* Users */}
              {results.users.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase">
                      Users ({results.users.length})
                    </h3>
                  </div>
                  {results.users.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0">
                        {getCategoryIcon(result.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.subtitle}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {result.metadata.role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Riders */}
              {results.riders.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase">
                      Riders ({results.riders.length})
                    </h3>
                  </div>
                  {results.riders.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0">
                        {getCategoryIcon(result.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.subtitle}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {result.metadata.isOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            result.metadata.isApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {result.metadata.isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Bookings */}
              {results.bookings.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase">
                      Bookings ({results.bookings.length})
                    </h3>
                  </div>
                  {results.bookings.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0">
                        {getCategoryIcon(result.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.subtitle}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            result.metadata.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : result.metadata.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {result.metadata.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Reviews */}
              {results.reviews.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase">
                      Reviews ({results.reviews.length})
                    </h3>
                  </div>
                  {results.reviews.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-shrink-0">
                        {getCategoryIcon(result.type)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {result.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.subtitle}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs text-yellow-600 font-medium">
                          {result.metadata.rating}⭐
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Found {totalResults} result{totalResults !== 1 ? "s" : ""} for
                  "{query}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
