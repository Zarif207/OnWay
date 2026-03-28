"use client";
import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, AlertCircle, Navigation, Car } from 'lucide-react';
import axios from 'axios';
import { geocodeAddress, getLocationSuggestions } from '@/utils/geocodingService';
import { useDebounce } from '@/hooks/useDebounce';
import '@/styles/location-dropdown.css';

const LocationInput = ({
  label,
  placeholder,
  value,
  onChange,
  onLocationSelect,
  type = 'pickup',
  isActive = false,
  onFocus,
  className = "",
  showYourLocationButton = true,
  onYourLocationClick = null
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastSearchRef = useRef('');
  const cacheRef = useRef({}); // Simple in-memory cache for suggestions
  const last429TimeRef = useRef(0); // Track last rate limit hit

  // Increased debounce delay to 1000ms for heavy geocoding protection
  const debouncedInputValue = useDebounce(inputValue, 1000);

  // Color scheme based on type
  const colorScheme = {
    pickup: {
      primary: 'blue',
      ring: 'ring-blue-500',
      border: 'border-blue-400',
      bg: 'bg-blue-50/30',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    dropoff: {
      primary: 'red',
      ring: 'ring-red-500',
      border: 'border-red-400',
      bg: 'bg-red-50/30',
      text: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    }
  };

  const colors = colorScheme[type];

  // Update input value when external value changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  // Handle debounced search with improved rate limiting and caching
  useEffect(() => {
    const searchLocations = async () => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (!debouncedInputValue || debouncedInputValue.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        setError('');
        return;
      }

      // Check cache first
      if (cacheRef.current[debouncedInputValue]) {
        setSuggestions(cacheRef.current[debouncedInputValue]);
        setShowSuggestions(cacheRef.current[debouncedInputValue].length > 0);
        setError('');
        setIsLoading(false);
        return;
      }

      if (debouncedInputValue === value || debouncedInputValue === lastSearchRef.current) {
        return; // Don't search if it's the same as current location or last search
      }

      setIsLoading(true);
      setError('');

      // Cooldown check: if we hit a 429 recently, wait 5 seconds
      const now = Date.now();
      if (now - last429TimeRef.current < 5000) {
        setIsLoading(false);
        setError('Rate limit hit. Retrying in a few seconds...');
        return;
      }

      // Create new abort controller for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const results = await getLocationSuggestions(debouncedInputValue, 'BD', controller.signal);

        // Cache the results
        cacheRef.current[debouncedInputValue] = results;

        // Only update if this is still the current search and not aborted
        if (!controller.signal.aborted) {
          setSuggestions(results);
          setShowSuggestions(true); // Always show if we have results or want to show empty state
          setSelectedIndex(-1);
          lastSearchRef.current = debouncedInputValue;
        }
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'AbortError') {
          return; // Ignore aborted requests
        }

        console.error('Search error:', err);

        // Handle rate limiting error specifically
        if (err.response?.status === 429 || err.message?.includes('429')) {
          last429TimeRef.current = Date.now();
          setError('Too many requests. Please wait a moment and try again.');
          console.warn('Rate limit hit, starting 5s cooldown');
        } else {
          setError(err.message || 'Failed to search locations');
        }
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    searchLocations();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedInputValue, value]); // Removed inputValue to prevent triggers on every keystroke

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    setError('');
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setInputValue(suggestion.name);
    onChange?.(suggestion.name);
    onLocationSelect?.(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();

    // Reset parent container styles
    const parentContainer = inputRef.current?.closest('.rounded-3xl');
    if (parentContainer) {
      parentContainer.style.overflow = '';
      parentContainer.style.zIndex = '';
    }
  };

  // Handle "Your Location" button click
  const handleYourLocationClick = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');
    setError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          // Get address for the coordinates
          const { reverseGeocode } = await import('@/utils/geocodingService');
          const addressData = await reverseGeocode(latitude, longitude);

          const locationName = addressData.name || `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

          const locationObj = {
            lat: latitude,
            lon: longitude,
            name: locationName,
            address: addressData.address || {},
            accuracy,
            isCurrentLocation: true
          };

          // Update input value and trigger location selection
          setInputValue(locationName);
          onChange?.(locationName);
          onLocationSelect?.(locationObj);

          // Call parent callback if provided
          onYourLocationClick?.(locationObj);

          console.log('✅ Current location set:', locationObj);

        } catch (err) {
          console.error('Failed to get address for current location:', err);

          // Fallback: use coordinates as name
          const locationName = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          const locationObj = {
            lat: latitude,
            lon: longitude,
            name: locationName,
            address: {},
            accuracy,
            isCurrentLocation: true
          };

          setInputValue(locationName);
          onChange?.(locationName);
          onLocationSelect?.(locationObj);
          onYourLocationClick?.(locationObj);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsGettingLocation(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location permissions.");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable. Please try again.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Failed to get current location. Please try again.");
            break;
        }
      },
      options
    );
  };

  // Clear location error after 5 seconds
  useEffect(() => {
    if (locationError) {
      const timer = setTimeout(() => setLocationError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [locationError]);

  // Handle manual search
  const handleSearch = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await geocodeAddress(inputValue);
      if (result) {
        onLocationSelect?.(result);
        setInputValue(result.name);
        onChange?.(result.name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    onFocus?.();
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
    // Ensure parent container allows overflow
    const parentContainer = inputRef.current?.closest('.rounded-3xl');
    if (parentContainer) {
      parentContainer.style.overflow = 'visible';
      parentContainer.style.zIndex = '10000';
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
        // Reset parent container styles
        const parentContainer = inputRef.current?.closest('.rounded-3xl');
        if (parentContainer) {
          parentContainer.style.overflow = '';
          parentContainer.style.zIndex = '';
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`location-input-container ${showSuggestions ? 'active' : ''} ${className}`} style={{ zIndex: showSuggestions ? 10000 : 'auto' }}>
      {/* Label */}
      <label className={`text-xs font-semibold uppercase tracking-wider transition-colors mb-2 block ${isActive ? colors.text : 'text-gray-500'
        }`}>
        <MapPin className="inline w-3 h-3 mr-1" />
        {label} {isActive && "(Click Map or Type)"}
      </label>

      {/* Input Container */}
      <div className="flex gap-2 relative">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className={`w-full bg-gray-50 border rounded-xl px-4 py-3 pr-10 focus:bg-white focus:${colors.ring} focus:ring-2 focus:border-transparent outline-none transition-all ${isActive ? `${colors.border} ${colors.bg}` : 'border-gray-200'
              } ${error ? 'border-red-300 bg-red-50' : ''}`}
          />

          {/* Loading indicator */}
          {(isLoading || isGettingLocation) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isLoading || isGettingLocation || !inputValue.trim()}
          className={`${colors.button} text-white px-5 py-3 rounded-xl transition-colors disabled:opacity-50 font-medium flex items-center gap-2`}
        >
          {(isLoading || isGettingLocation) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          Find
        </button>
      </div>

      {/* Your Location Button */}
      {showYourLocationButton && (
        <div className="mt-2">
          <button
            onClick={handleYourLocationClick}
            disabled={isGettingLocation || isLoading}
            className={`flex items-center gap-2 text-sm ${colors.text} hover:${colors.text}/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Getting your location...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Your Location</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Messages */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {locationError && (
        <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {locationError}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="location-dropdown"
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`dropdown-item ${index === selectedIndex ? 'selected' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${colors.text}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.address?.road || suggestion.address?.name || 'Unknown Location'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.name}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : !isLoading && !error && debouncedInputValue.length >= 3 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found for "{debouncedInputValue}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;