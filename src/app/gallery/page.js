'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useRef, useState } from 'react'
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

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />
      <main className="flex-grow p-6">
        <div className="flex items-center mb-4">
          <div className="flex-grow">
            <SearchBar />
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 rounded-full"
            aria-label="Add Photos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            </svg>
          </button>
        </div>
        {showUpload && (
          <div className="mb-8">
            <ImageUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}
        <ImageGallery ref={galleryRef} userId={user.id} />
      </main>
    </div>
  )
}
