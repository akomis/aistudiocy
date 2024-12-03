"use client";

import HomeButton from "@/components/HomeButton";
import Logo from "@/components/Logo";
import { Label } from "@radix-ui/react-label";

export default function Error() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-10">
      <div>
        <Label className="text-2xl">
          An error occured but you can always go back to{" "}
        </Label>
        <HomeButton />
      </div>
      <Logo />
    </div>
  );
}
