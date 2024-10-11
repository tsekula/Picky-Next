'use client'

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import Image from 'next/image'

const ImageGallery = forwardRef(({ userId }, ref) => {
  const [images, setImages] = useState([])
  const [error, setError] = useState(null)

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images')
      if (!response.ok) {
        throw new Error('Failed to fetch images')
      }
      const data = await response.json()
      setImages(data)
    } catch (error) {
      console.error('Error fetching images:', error)
      setError('Failed to load images. Please try again later.')
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  useImperativeHandle(ref, () => ({
    refreshGallery: fetchImages
  }))

  if (error) {
    return <p className="text-center text-red-500">{error}</p>
  }

  if (images.length === 0) {
    return <p className="text-center">No images yet! Upload some above!</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <div key={image.id} className="relative aspect-square">
          <Image
            src={image.signedUrl}
            alt={image.file_name || 'Uploaded image'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            style={{ objectFit: 'cover' }}
            className="rounded"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  )
})

ImageGallery.displayName = 'ImageGallery'

export default ImageGallery
