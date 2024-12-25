"use client";

import Image from "next/image";

import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import { Label } from "./ui/label";

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
        paragraph: ({ children }) => <p className="leading-7">{children}</p>,

        heading: ({ children, level }) => {
          switch (level) {
            case 1:
              return <Label className="text-4xl mb-10 flex">{children}</Label>;
            case 2:
              return <Label className="text-3xl mb-8 flex">{children}</Label>;
            case 3:
              return <Label className="text-2xl mb-4 flex">{children}</Label>;
            case 4:
              return <Label className="text-2xl mb-2 flex">{children}</Label>;
            case 5:
              return <Label className="text-lg mb-2 flex">{children}</Label>;
            case 6:
              return <Label className="text-md mb-2 flex">{children}</Label>;
            default:
              return <Label className="text-sm mb-2 flex">{children}</Label>;
          }
        },
      }}
    />
  );
}
