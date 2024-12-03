"use client";

import HomeButton from "@/components/HomeButton";
import { Label } from "@radix-ui/react-label";

type Props = {
  error: Error & { digest?: string };
};

export default function Error({ error }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-20">
      <div className="flex flex-col items-center justify-center">
        <div>
          <Label className="text-2xl">
            An error occured but you can always go back to{" "}
          </Label>
          <HomeButton />
        </div>
        <Label className="font-thin text-lg">{`Error: ${error.message}`}</Label>
      </div>

      <HomeButton isIcon />
    </div>
  );
}
