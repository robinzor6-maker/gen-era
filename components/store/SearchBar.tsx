'use client';

import { useState, useCallback, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({ onSearch, placeholder = 'SEARCH THE ARCHIVE...' }: SearchBarProps) {
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, 300);

  const handleSearch = useCallback(
    (q: string) => { onSearch(q); },
    [onSearch]
  );

  useEffect(() => {
    handleSearch(debounced);
  }, [debounced, handleSearch]);

  return (
    <div className="search-bar-wrapper">
      <span className="search-icon" aria-hidden="true">𓂀</span>
      <input
        id="store-search"
        type="search"
        className="search-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        autoComplete="off"
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => setValue('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
