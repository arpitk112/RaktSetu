"use client";

import React, { useState, useEffect, useRef } from "react";
import { GeocodeSuggestion } from "@/app/api/geocode/search/route";

export interface LocationValue {
  address: string;
  lat: number | null;
  lng: number | null;
}

export interface LocationInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  coords: { lat: number; lng: number } | null;
  onChange: (val: LocationValue) => void;
  error?: string;
  required?: boolean;
  id?: string;
}

export function LocationInput({
  label = "Location",
  placeholder = "Search area, city or hospital",
  value,
  coords,
  onChange,
  error,
  required = false,
  id = "location-search",
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal input value if prop changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle typing with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    setLocationError(null);

    // If user edits text manually, clear existing coords until confirmed
    onChange({ address: text, lat: null, lng: null });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/geocode/search?q=${encodeURIComponent(text.trim())}`
        );
        const data = await res.json();
        if (data.success && data.suggestions?.length > 0) {
          setSuggestions(data.suggestions);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (err) {
        console.error("Geocode search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Select a suggested place
  const handleSelectSuggestion = (sug: GeocodeSuggestion) => {
    setInputValue(sug.displayName);
    setIsOpen(false);
    setSuggestions([]);
    onChange({
      address: sug.displayName,
      lat: sug.lat,
      lng: sug.lng,
    });
  };

  // GPS Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode via our server route
          const res = await fetch(
            `/api/geocode/reverse?lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();

          const detectedAddress = data.address || `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setInputValue(detectedAddress);
          onChange({
            address: detectedAddress,
            lat: latitude,
            lng: longitude,
          });
        } catch {
          const fallback = `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setInputValue(fallback);
          onChange({
            address: fallback,
            lat: latitude,
            lng: longitude,
          });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = "Could not detect location. Please type your area or city.";
        if (err.code === 1) {
          msg = "Location permission denied. Please type your area or city.";
        } else if (err.code === 2) {
          msg = "Location position unavailable. Please type your area.";
        } else if (err.code === 3) {
          msg = "Location request timed out. Please try again or type area.";
        }
        setLocationError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasCoords = coords?.lat !== null && coords?.lng !== null && coords?.lat !== undefined;

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-1.5 relative">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="text-[14px] sm:text-[15px] font-semibold text-[#1F1F1F] flex items-center justify-between"
        >
          <span className="flex items-center gap-1">
            {label}
            {required && <span className="text-[#C62828]" aria-hidden="true">*</span>}
          </span>
          {hasCoords && (
            <span className="text-[12px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              GPS Confirmed ({coords?.lat?.toFixed(2)}°, {coords?.lng?.toFixed(2)}°)
            </span>
          )}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full h-[48px] px-3.5 pr-10 rounded-[10px] border-[1.5px] text-[16px] text-[#1F1F1F] bg-white transition-colors placeholder:text-[#5F5F5F] focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 ${
            error || locationError
              ? "border-[#C62828]"
              : hasCoords
              ? "border-green-600 bg-green-50/20"
              : "border-[#E0E0E0] hover:border-[#BDBDBD]"
          }`}
        />

        {/* Search Spinner or Pin Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-[#5F5F5F]">
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-[#C62828] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-4 h-4 text-[#5F5F5F]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <ul
            className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg max-h-[220px] overflow-y-auto divide-y divide-[#F7F7F7]"
            role="listbox"
          >
            {suggestions.map((sug) => (
              <li
                key={sug.id}
                role="option"
                aria-selected="false"
                onClick={() => handleSelectSuggestion(sug)}
                className="px-4 py-3 hover:bg-[#FFF5F5] cursor-pointer flex items-start gap-2.5 transition-colors"
              >
                <svg
                  className="w-4 h-4 text-[#C62828] mt-0.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-[#1F1F1F]">
                    {sug.name}
                  </span>
                  <span className="text-[12px] text-[#5F5F5F] leading-tight">
                    {sug.displayName}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Action: Use My Current Location Button */}
      <div className="flex items-center justify-between mt-0.5">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#C62828] hover:text-[#B71C1C] disabled:opacity-50 cursor-pointer focus:outline-none focus:underline"
        >
          <svg
            className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {isLocating ? "Detecting GPS location..." : "Use my current location"}
        </button>

        {hasCoords && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              onChange({ address: "", lat: null, lng: null });
            }}
            className="text-[12px] text-[#5F5F5F] hover:text-[#C62828] underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Errors */}
      {locationError && (
        <p className="text-[13px] text-[#C62828] font-medium mt-0.5">
          {locationError}
        </p>
      )}
      {!locationError && error && (
        <p className="text-[13px] text-[#C62828] font-medium mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
