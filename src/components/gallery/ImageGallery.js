'use client'

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import Image from 'next/image'

const ImageGallery = forwardRef(({ userId, onSelectionChange }, ref) => {
  const [images, setImages] = useState([])
  const [error, setError] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])

  const fetchImages = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/images?t=${timestamp}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      setImages(data);
      setSelectedImages([]); // Clear selections when refreshing
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images. Please try again later.');
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  useImperativeHandle(ref, () => ({
    refreshGallery: fetchImages,
    removeDeletedImages: (deletedIds) => {
      setImages(prevImages => prevImages.filter(img => !deletedIds.includes(img.id)));
    }
  }))

  const handleCheckboxChange = (imageId) => {
    setSelectedImages(prev => {
      const newSelection = prev.includes(imageId) 
        ? prev.filter(id => id !== imageId) 
        : [...prev, imageId];
      onSelectionChange(newSelection);
      return newSelection;
    });
  }

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: selectedImages }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete images')
      }

      fetchImages()
      setSelectedImages([])
    } catch (error) {
      console.error('Error deleting images:', error)
      setError('Failed to delete images. Please try again later.')
    }
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  if (images.length === 0) {
    return <p className="text-center">No images yet! Upload some above!</p>
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative group aspect-square">
          <img
            src={image.signedUrl}
            alt={image.file_name}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className={`absolute top-2 left-2 z-10 transition-opacity duration-300 ${
            selectedImages.includes(image.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <input
              type="checkbox"
              checked={selectedImages.includes(image.id)}
              onChange={() => handleCheckboxChange(image.id)}
              className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-blue-600 transition duration-150 ease-in-out bg-white bg-opacity-75 rounded"
            />
          </div>
        </div>
      ))}
    </div>
  )
})

ImageGallery.displayName = 'ImageGallery'

export default ImageGallery
