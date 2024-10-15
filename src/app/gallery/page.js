'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopNavBar from '@/components/layout/TopNavBar'
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

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">

      <main className="flex-grow">
        <ImageGallery 
          ref={galleryRef} 
          userId={user.id} 
        />
      </main>
    </div>
  )
}
