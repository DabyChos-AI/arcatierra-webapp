'use client'

import OptimizedImage from '@/components/ui/OptimizedImage'

const InstagramEmbed = () => {
  return (
    <div className="w-full rounded-lg overflow-hidden">
      <a 
        href="https://www.instagram.com/p/DCqGBjvyJnq/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full hover:opacity-90 transition-opacity"
      >
        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <OptimizedImage
            src="/images/baldio-instagram-post.jpg"
            alt="Baldío Restaurante - Taquiza de cerdo con mole"
            fill
            className="object-cover" />
        </div>
      </a>
    </div>
  )
}

export default InstagramEmbed
