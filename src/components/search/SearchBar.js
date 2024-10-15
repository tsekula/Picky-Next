'use client'

import { useState, useEffect } from 'react'

export default function SearchBar({ onSearch, onReset, imageCount }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchActive, setIsSearchActive] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchQuery)
    setIsSearchActive(true)
  }

  const handleReset = () => {
    setSearchQuery('')
    setIsSearchActive(false)
    onReset()
  }

  useEffect(() => {
    if (searchQuery === '') {
      setIsSearchActive(false)
    }
  }, [searchQuery])

  const placeholderText = imageCount === null 
    ? 'Loading images...' 
    : `Search ${imageCount} images`

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholderText}
            className="w-full p-2 border rounded-l pr-8"
          />
          {isSearchActive && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Search
        </button>
      </div>
    </form>
  )
}
