"use client";

import { useState } from "react";
import Section from "./Section";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = { data: any[] };

const DynamicBackground = ({ data }: Props) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const router = useRouter();

  const images = data.map((image: any) => image.Image?.url);

  return (
    <Section
      className="h-screen flex items-center px-14"
      style={{
        backgroundImage: `url(${images[slideIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={"flex justify-between w-full hover:cursor-pointer"}
        onClick={() => {
          router.push("/catalogue");
        }}
      >
        <Image
          className="w-[50px]"
          src="/logo.png"
          alt="logo"
          width={209}
          height={415}
          style={{ objectFit: "contain" }}
        />

        <div className="flex flex-col gap-2 w-24">
          {data.map((header: any) => (
            <div
              key={header.Category}
              className="flex items-center font-thin text-right"
            >
              <Label
                className={cn(
                  "text-xl font-bold text-white hover:cursor-pointer hover:text-gray-700",
                  {
                    "text-gray-400": slideIndex === data.indexOf(header),
                  }
                )}
                htmlFor={header.Category}
                onMouseEnter={() => setSlideIndex(data.indexOf(header))}
              >
                {header.Category}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default DynamicBackground;
