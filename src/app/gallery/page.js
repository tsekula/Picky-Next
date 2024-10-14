'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TopNavBar from '@/components/layout/TopNavBar'
import SearchBar from '@/components/search/SearchBar'
import ImageUpload from '@/components/upload/ImageUpload'
import ImageGallery from '@/components/gallery/ImageGallery'

export default function Gallery() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const galleryRef = useRef(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [supabase, router])

  const handleUploadSuccess = () => {
    if (galleryRef.current) {
      galleryRef.current.refreshGallery()
    }
    setShowUpload(false)
  }

  const handleSelectionChange = useCallback((newSelection) => {
    setSelectedImages(newSelection)
  }, [])

  const handleDeleteSelected = async () => {
    if (selectedImages.length > 0) {
      try {
        const response = await fetch('/api/images/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageIds: selectedImages }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete images');
        }

        const result = await response.json();
        console.log(result.message);

        // Clear the selected images
        setSelectedImages([]);

        // Refresh the gallery after the state has been cleared
        if (galleryRef.current) {
          galleryRef.current.removeDeletedImages(selectedImages);
          await galleryRef.current.refreshGallery();
        }

      } catch (error) {
        console.error('Error deleting images:', error);
        alert('Failed to delete images. Please try again later.');
      }
    }
  };

  const handleAnalyzeUnprocessed = async () => {
    try {
      const response = await fetch('/api/analysis/trigger', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to trigger analysis');
      }

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error triggering analysis:', error);
    }
  };

  const handleSearch = async (query) => {
    try {
      if (query.trim() === '') {
        // If the search query is empty, clear the filter
        if (galleryRef.current) {
          galleryRef.current.clearFilter()
        }
      } else {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error('Search failed')
        }
        const searchResults = await response.json()
        if (galleryRef.current) {
          galleryRef.current.filterImages(searchResults)
        }
      }
    } catch (error) {
      console.error('Error searching images:', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />
      <div className="bg-gray-100 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-grow mr-4">
            <SearchBar onSearch={handleSearch} />
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded-full mr-2"
            aria-label="Add Photos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={handleDeleteSelected}
            className={`p-2 rounded-full mr-2 ${
              selectedImages.length > 0
                ? 'bg-red-500 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={selectedImages.length === 0}
            aria-label="Delete Selected"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button
            onClick={handleAnalyzeUnprocessed}
            className="p-2 rounded-full bg-purple-500 hover:bg-purple-700 text-white mr-2"
            aria-label="Analyze Unprocessed Images"
          >
            🪄
          </button>
        </div>
      </div>
      <main className="flex-grow p-6">
        {showUpload && (
          <div className="mb-8">
            <ImageUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}
        <ImageGallery 
          ref={galleryRef} 
          userId={user.id} 
          onSelectionChange={handleSelectionChange}
        />
      </main>
    </div>
  )
}
