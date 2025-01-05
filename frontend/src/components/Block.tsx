"use client";

import Image from "next/image";

import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";

export default function Block({
  content,
}: {
  readonly content: BlocksContent;
}) {
  if (!content) return null;

  return (
    <BlocksRenderer
      content={content}
      blocks={{
        image: ({ image }) => {
          return (
            <Image
              src={image.url}
              width={image.width}
              height={image.height}
              alt={image.alternativeText || ""}
            />
          );
        },
        paragraph: ({ children }) => (
          <p className="leading-6 text-justify">{children}</p>
        ),

        heading: ({ children, level }) => {
          switch (level) {
            case 1:
              return <p className="text-6xl mb-10 flex">{children}</p>;
            case 2:
              return <p className="text-5xl mb-5 flex">{children}</p>;
            case 3:
              return <p className="text-3xl mb-4 flex">{children}</p>;
            case 4:
              return <p className="text-2xl mb-2 flex">{children}</p>;
            case 5:
              return <p className="text-lg mb-2 flex">{children}</p>;
            case 6:
              return <p className="text-md mb-2 flex">{children}</p>;
            default:
              return <p className="text-sm mb-2 flex">{children}</p>;
          }
        },
      }}
    />
  );
}
