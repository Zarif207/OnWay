"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

/**
 * Custom hook for global smart search
 * Implements debouncing and manages search state
 */
export const useGlobalSearch = (debounceDelay = 400) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    users: [],
    riders: [],
    bookings: [],
    reviews: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  /**
   * Perform search API call
   */
  const performSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        setResults({ users: [], riders: [], bookings: [], reviews: [] });
        setTotalResults(0);
        setIsOpen(false);
        return;
      }

      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/search`, {
          params: {
            q: searchQuery,
            limit: 5,
          },
          signal: abortControllerRef.current.signal,
        });

        if (response.data.success) {
          setResults(response.data.results);
          setTotalResults(response.data.totalResults);
          setIsOpen(true);
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Search error:", err);
          setError("Search failed. Please try again.");
          setResults({ users: [], riders: [], bookings: [], reviews: [] });
          setTotalResults(0);
        }
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  /**
   * Handle query change with debouncing
   */
  const handleQueryChange = useCallback(
    (newQuery) => {
      setQuery(newQuery);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        performSearch(newQuery);
      }, debounceDelay);
    },
    [performSearch, debounceDelay]
  );

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults({ users: [], riders: [], bookings: [], reviews: [] });
    setTotalResults(0);
    setIsOpen(false);
    setError(null);

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Close dropdown
   */
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Open dropdown
   */
  const openDropdown = useCallback(() => {
    if (totalResults > 0) {
      setIsOpen(true);
    }
  }, [totalResults]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    results,
    loading,
    error,
    totalResults,
    isOpen,
    handleQueryChange,
    clearSearch,
    closeDropdown,
    openDropdown,
  };
};
