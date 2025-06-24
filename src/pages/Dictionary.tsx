import React, { useState, useEffect } from "react";
import { useSignCache } from "../features/lessons/hooks/useSignCache";
import { isValidImageUrl, getFallbackImageUrl } from "../utils/imageUtils";
import type { Sign } from "../types/lesson";
import { Link } from "react-router-dom";

const Dictionary: React.FC = () => {
  const { allSigns, isLoading, refreshCache } = useSignCache();
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.log("Dictionary mounted or updated!");
  });

  // All alphabet letters
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Refresh the cache on mount only
  useEffect(() => {
    if (allSigns.length === 0 && !isLoading) {
      refreshCache();
    }
  }, []);

  // Dynamically filter signs based on search query
  const filteredSigns = searchQuery
    ? allSigns.filter((sign) =>
        sign.word.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Dynamically filter signs based on selected letter
  const letterSigns = selectedLetter
    ? allSigns.filter((sign) =>
        sign.word.toUpperCase().startsWith(selectedLetter)
      )
    : [];

  // Handle letter click
  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setSearchQuery(""); // Clear search when selecting a letter
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedLetter(null); // Clear letter selection when searching
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-[var(--color-blue)]">
        Sign Dictionary
      </h1>

      {/* Cache refresh button */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-[var(--color-blue)] mb-3 sm:mb-0 font-medium">
            {allSigns.length > 0
              ? `${allSigns.length} signs loaded in cache`
              : "No signs currently cached"}
          </p>
          <button
            onClick={refreshCache}
            disabled={isLoading}
            className="px-4 py-2 bg-[var(--color-blue)] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Loading..." : "Reload all signs"}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search for a sign..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-3 border-2 rounded-lg border-gray-300 focus:border-[var(--color-blue)] outline-none"
        />
      </div>

      {/* Alphabet filter */}
      <div className="grid grid-cols-9 sm:grid-cols-13 gap-2 mb-8">
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            className={`p-2 text-center font-bold rounded-lg hover:bg-blue-50 transition-colors
              ${
                selectedLetter === letter
                  ? "bg-[var(--color-blue)] text-white hover:text-[var(--color-blue)]"
                  : "bg-gray-100 text-[var(--color-blue)]"
              }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-blue)] border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Display signs based on selection or search */}
      <div className="w-full mx-auto" style={{ maxWidth: "1200px" }}>
        <div className="flex flex-wrap justify-center gap-6">
          {searchQuery
            ? filteredSigns.map((sign) => (
                <SignCard key={sign.id} sign={sign} />
              ))
            : letterSigns.map((sign) => <SignCard key={sign.id} sign={sign} />)}
        </div>
      </div>

      {/* Empty state */}
      {!isLoading &&
        ((searchQuery && filteredSigns.length === 0) ||
          (selectedLetter && letterSigns.length === 0)) && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">
              No signs found{" "}
              {searchQuery
                ? `for "${searchQuery}"`
                : `for letter ${selectedLetter}`}
            </p>
          </div>
        )}

      {/* Instructions if no filter is active */}
      {!isLoading && !selectedLetter && !searchQuery && (
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <p className="text-[var(--color-blue)] text-lg font-medium">
            Select a letter above or search for a sign to begin
          </p>
        </div>
      )}
    </div>
  );
};

// Sign card component
const SignCard: React.FC<{ sign: Sign }> = ({ sign }) => {
  return (
    <div className="w-[200px] flex-shrink-0">
      <div className="block w-full h-full border-2 border-gray-200 p-4 rounded-xl hover:border-[var(--color-blue)] hover:shadow-md transition-all bg-white">
        <Link
          to={`/dictionary/${sign.id}`}
          className="h-40 flex justify-center items-center mb-3"
        >
          <img
            src={
              isValidImageUrl(sign.mediaUrl)
                ? sign.mediaUrl
                : getFallbackImageUrl(sign.word)
            }
            alt={sign.word}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </Link>
        <h3 className="text-xl font-bold text-center text-gray-800">
          {sign.word}
        </h3>
        {sign.definition && (
          <p className="text-sm text-gray-700 text-center mt-1 line-clamp-2">
            {sign.definition}
          </p>
        )}
        <div className="mt-3 text-center">
          <span className="text-sm text-[var(--color-blue)] font-medium inline-block hover:underline">
            View details →
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dictionary;
