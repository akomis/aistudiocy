"use client"

import { useState } from "react"
import Image from "next/image"
import Lightbox from "yet-another-react-lightbox"

type Props = {
  src: string
  alt?: string
}

export default function PageImage({ src, alt = "" }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="mt-12 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity"
        />
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src }]}
        carousel={{ finite: true }}
        styles={{ root: { "--yarl__color_backdrop": "rgba(0, 0, 0, .9)" } }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullUp: true,
          closeOnPullDown: true,
        }}
      />
    </>
  )
}
