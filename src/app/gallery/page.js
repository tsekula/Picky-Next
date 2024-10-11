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
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />
      <main className="flex-grow p-6">
        <SearchBar />
        <ImageUpload onUploadSuccess={handleUploadSuccess} />
        <ImageGallery ref={galleryRef} userId={user.id} />
      </main>
    </div>
  )
}
