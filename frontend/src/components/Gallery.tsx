"use client";

import { useState } from "react";
import {
  Photo,
  RenderImageContext,
  RenderImageProps,
  MasonryPhotoAlbum,
} from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "react-photo-album/masonry.css";
import Image from "next/image";

function renderNextImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext
) {
  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: `${width} / ${height}`,
      }}
      className="transition-all duration-500 ease-in-out hover:scale-105"
    >
      <Image
        src={photo}
        alt={alt}
        title={title}
        sizes={sizes}
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
      />
    </div>
  );
}

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | undefined>(
    undefined
  );

  return (
    <>
      <MasonryPhotoAlbum
        photos={photos}
        render={{ image: renderNextImage }}
        onClick={({ event, photo }) => {
          if (event.shiftKey || event.altKey || event.metaKey) return;
          event.preventDefault();
          setLightboxPhoto(photo);
        }}
      />

      <Lightbox
        open={Boolean(lightboxPhoto)}
        close={() => setLightboxPhoto(undefined)}
        slides={
          lightboxPhoto
            ? [
                lightboxPhoto,
                ...photos.filter((photo) => photo !== lightboxPhoto),
              ]
            : undefined
        }
        carousel={{ finite: true }}
        styles={{ root: { "--yarl__color_backdrop": "rgba(0, 0, 0, .8)" } }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullUp: true,
          closeOnPullDown: true,
        }}
      />
    </>
  );
}
