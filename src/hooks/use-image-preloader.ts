"use client";

import { useEffect, useState } from "react";

export default function useImagePreloader(imageUrls: (string | undefined)[]) {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const urls = imageUrls.filter((url): url is string => Boolean(url));

    if (urls.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = urls.length;

    const handleLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setImagesLoaded(true);
      }
    };

    urls.forEach((url) => {
      const img = new Image();
      img.onload = handleLoad;
      img.onerror = handleLoad; // Count errors as loaded to prevent blocking
      img.src = url;
    });
  }, [imageUrls]);

  return imagesLoaded;
}
