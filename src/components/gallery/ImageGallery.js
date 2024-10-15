'use client'

import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import SearchBar from '../search/SearchBar'
import ImageUpload from '../upload/ImageUpload'

const ImageGallery = forwardRef(({ userId }, ref) => {
  const [images, setImages] = useState([])
  const [filteredImages, setFilteredImages] = useState([])
  const [isFiltered, setIsFiltered] = useState(false)
  const [error, setError] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [lightboxImage, setLightboxImage] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [totalImageCount, setTotalImageCount] = useState(null)  // Initialize to null

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/images`)
      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }
      const data = await response.json()
      setImages(data)
      setFilteredImages([])
      setIsFiltered(false)
      setSelectedImages([])
      setTotalImageCount(data.length)  // Set the count after successful fetch
      return data
    } catch (error) {
      console.error('Error fetching images:', error)
      setError('Failed to load images. Please try again later.')
      return []
    }
  }

  useEffect(() => {
    fetchImages()  // Call fetchImages when the component mounts
  }, [])

  useImperativeHandle(ref, () => ({
    refreshGallery: fetchImages,
    addNewImages: (newImages) => {
      setImages(prevImages => [...newImages, ...prevImages])
    },
    removeDeletedImages: (deletedIds) => {
      setImages(prevImages => {
        const updatedImages = prevImages.filter(img => !deletedIds.includes(img.id));
        setFilteredImages(prevFiltered => prevFiltered.filter(img => !deletedIds.includes(img.id)));
        return updatedImages;
      });
      setIsFiltered(false);
    },
    filterImages: (searchResults) => {
      const filteredIds = new Set(searchResults.map(img => img.id))
      setFilteredImages(images.filter(img => filteredIds.has(img.id)))
      setIsFiltered(true)
    },
    clearFilter: () => {
      setFilteredImages([])
      setIsFiltered(false)
    }
  }))

  const handleUploadSuccess = async (newImages) => {
    const processedImages = newImages.map(img => ({
      ...img,
      thumbnailUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/${img.thumbnail_path}`
    }));
    setImages(prevImages => [...processedImages, ...prevImages]);
    setShowUpload(false);
  }

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

        setImages(prevImages => prevImages.filter(img => !selectedImages.includes(img.id)));
        setFilteredImages(prevFiltered => prevFiltered.filter(img => !selectedImages.includes(img.id)));
        setSelectedImages([]);

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

  const handleCheckboxChange = useCallback((imageId) => {
    setSelectedImages(prev => {
      const newSelection = prev.includes(imageId) 
        ? prev.filter(id => id !== imageId) 
        : [...prev, imageId]
      return newSelection
    })
  }, [])

  const openLightbox = async (image) => {
    try {
      const response = await fetch(`/api/images?id=${image.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch image details');
      }
      const fullImageData = await response.json();
      setLightboxImage(fullImageData);
    } catch (error) {
      console.error('Error opening lightbox:', error);
      // Handle error (e.g., show an error message to the user)
    }
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  const handleSearch = async (query) => {
    try {
      if (query.trim() === '') {
        handleSearchReset()
      } else {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!response.ok) {
          throw new Error('Search failed')
        }
        const searchResults = await response.json()
        const filteredIds = new Set(searchResults.map(img => img.id))
        setFilteredImages(images.filter(img => filteredIds.has(img.id)))
        setIsFiltered(true)
      }
    } catch (error) {
      console.error('Error searching images:', error)
      setError('Failed to search images. Please try again later.')
    }
  }

  const handleSearchReset = () => {
    setFilteredImages([])
    setIsFiltered(false)
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  if (images.length === 0) {
    return <p className="text-center">Loading...</p>
  }

  const breakpointColumnsObj = {
    default: 4,
    1800: 8,
    1100: 6,
    700: 4,
    500: 3
  }

  return (
    <>
      <div className="bg-gray-100 p-4 mb-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex-grow mr-4">
            <SearchBar 
              onSearch={handleSearch} 
              onReset={handleSearchReset} 
              imageCount={totalImageCount}
            />
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
      {showUpload && (
        <div className="mb-8">
          <ImageUpload onUploadSuccess={handleUploadSuccess} />
        </div>
      )}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex w-auto"
        columnClassName="bg-clip-padding"
        style={{ margin: '0 -2px' }}
      >
        {(isFiltered ? filteredImages : images).map((image) => (
          <div key={image.id} className="mb-4 relative group" style={{ padding: '0 4px' }}>
            <Image
              className="w-full rounded-sm object-cover object-center cursor-pointer transition-all duration-300 group-hover:opacity-75"
              src={image.thumbnailUrl}
              alt={image.file_name}
              width={500}
              height={500}
              loading="lazy"
              onClick={() => openLightbox(image)}
              priority={false}
              unoptimized={false}
            />
            <div className={`absolute top-2 left-2 z-10 transition-opacity duration-300 ${
              selectedImages.includes(image.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <input
                type="checkbox"
                checked={selectedImages.includes(image.id)}
                onChange={() => handleCheckboxChange(image.id)}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out bg-white bg-opacity-75 rounded"
              />
            </div>
          </div>
        ))}
      </Masonry>

      {lightboxImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeLightbox}>
          <div className="max-w-7xl max-h-full p-4 flex">
            <div className="w-2/3 pr-4">
              <img
                src={lightboxImage.signedUrl}
                alt={lightboxImage.file_name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="w-1/3 bg-white text-black p-4 overflow-y-auto text-sm">
              {lightboxImage.objects && (
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">Objects Detected:</h3>
                  <ul className="list-disc list-inside">
                    {lightboxImage.objects.map((obj, index) => (
                      <li key={index}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
              {lightboxImage.text_detected && lightboxImage.text_detected.length > 0 && (
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">Text Detected:</h3>
                  <ul className="list-disc list-inside">
                    {lightboxImage.text_detected.map((text, index) => (
                      <li key={index}>{text}</li>
                    ))}
                  </ul>
                </div>
              )}
              {lightboxImage.people && (
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">People:</h3>
                  <p>{lightboxImage.people}</p>
                </div>
              )}
              {lightboxImage.landmarks && lightboxImage.landmarks.length > 0 && (
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">Landmarks:</h3>
                  <ul className="list-disc list-inside">
                    {lightboxImage.landmarks.map((landmark, index) => (
                      <li key={index}>{landmark}</li>
                    ))}
                  </ul>
                </div>
              )}
              {lightboxImage.scene_description && (
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">Scene Description:</h3>
                  <p>{lightboxImage.scene_description}</p>
                </div>
              )}
              {lightboxImage.qualitative_aspects && (
                <div className="mb-3">
                  <h3 className="text-lg font-semibold">Qualitative Aspects:</h3>
                  <p>{lightboxImage.qualitative_aspects}</p>
                </div>
              )}
              <div className="mt-6 pt-3 border-t border-gray-200">
                <h2 className="text-xl font-bold mb-2">{lightboxImage.file_name}</h2>
                <p><strong>Uploaded:</strong> {new Date(lightboxImage.uploaded_at).toLocaleString()}</p>
                <p><strong>File Size:</strong> {(lightboxImage.file_size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>MIME Type:</strong> {lightboxImage.mime_type}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

ImageGallery.displayName = 'ImageGallery'

export default ImageGallery