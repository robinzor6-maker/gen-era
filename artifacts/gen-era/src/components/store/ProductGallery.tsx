import { useState } from 'react';

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
      <div className="gallery-main">
        {activeImage ? (
          <img
            src={activeImage}
            alt={productName}
            className="gallery-main-img"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="gallery-placeholder">
            <span className="placeholder-glyph">𓂀</span>
          </div>
        )}
      </div>

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
              style={{ position: 'relative' }}
            >
              <img
                src={src}
                alt={`${productName} view ${i + 1}`}
                className="thumb-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
