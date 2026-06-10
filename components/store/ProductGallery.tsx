'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  mainImage: string;
  gallery: string[];
  productName: string;
}

export default function ProductGallery({ mainImage, gallery, productName }: ProductGalleryProps) {
  const allImages = [mainImage, ...gallery].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = allImages[activeIndex];

  return (
    <div className="product-gallery">
      {/* Main display */}
      <div className="gallery-main">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={productName}
            fill
            className="gallery-main-img"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="gallery-placeholder">
            <span className="placeholder-glyph">𓂀</span>
          </div>
        )}
      </div>

      {/* Thumbnails — only shown if there is more than 1 image */}
      {allImages.length > 1 && (
        <div className="gallery-thumbs" role="list">
          {allImages.map((src, i) => (
            <button
              key={src}
              id={`gallery-thumb-${i}`}
              className={`gallery-thumb ${i === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              role="listitem"
            >
              <Image
                src={src}
                alt={`${productName} view ${i + 1}`}
                fill
                className="thumb-img"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
