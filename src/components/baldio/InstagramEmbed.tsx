'use client'

import Image from 'next/image'

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
          <Image
            src="/images/baldio-instagram-post.jpg"
            alt="Baldío Restaurante - Taquiza de cerdo con mole"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </a>
    </div>
  )
}

export default InstagramEmbed
