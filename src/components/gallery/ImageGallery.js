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
    <div className="columns-4 md:columns-5 lg:columns-6 xl:columns-7 2xl:columns-8 gap-0">
      {images.map((image, index) => (
        <div key={image.id} className="relative w-full break-inside-avoid mb-0">
          <Image
            src={image.signedUrl}
            alt={image.file_name || 'Uploaded image'}
            width={500}
            height={500}
            sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, (max-width: 1280px) 16.66vw, (max-width: 1536px) 14.28vw, 12.5vw"
            className="w-full h-auto"
            priority={index === 0}
            onError={() => console.error(`Failed to load image: ${image.file_name}`)}
          />
        </div>
      ))}
    </div>
  )
})

ImageGallery.displayName = 'ImageGallery'

export default ImageGallery
