'use client'

import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import Image from 'next/image'
import Masonry from 'react-masonry-css'

const ImageGallery = forwardRef(({ userId, onSelectionChange, images: propImages }, ref) => {
  const [images, setImages] = useState([])
  const [filteredImages, setFilteredImages] = useState([])
  const [isFiltered, setIsFiltered] = useState(false)
  const [error, setError] = useState(null)
  const [selectedImages, setSelectedImages] = useState([])
  const [lightboxImage, setLightboxImage] = useState(null)

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
      return data
    } catch (error) {
      console.error('Error fetching images:', error)
      setError('Failed to load images. Please try again later.')
      return []
    }
  }

  useEffect(() => {
    fetchImages()
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
      setIsFiltered(false); // Reset the filter state
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

  const handleCheckboxChange = useCallback((imageId) => {
    setSelectedImages(prev => {
      const newSelection = prev.includes(imageId) 
        ? prev.filter(id => id !== imageId) 
        : [...prev, imageId]
      onSelectionChange(newSelection)
      return newSelection
    })
  }, [onSelectionChange])

  const openLightbox = async (image) => {
    try {
      const response = await fetch(`/api/images?id=${image.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch image details');
      }
      const imageDetails = await response.json();
      setLightboxImage({ ...image, ...imageDetails });
    } catch (error) {
      console.error('Error fetching image details:', error);
      setLightboxImage(image);
    }
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  if (images.length === 0) {
    return <p className="text-center">No images yet! Upload some above!</p>
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
