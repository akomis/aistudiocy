"use client";

import HomeButton from "@/components/HomeButton";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
};

export default function Error({ error }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-20">
      <div className="flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-2xl">We are so sorry about this.</p>
          <p className="text-2xl">
            If you think this was our fault please{" "}
            <Link href="/#footer">contact us</Link>.
          </p>
        </div>
        <p className="font-thin text-lg max-w-lg">{`Error: (${error.message})`}</p>
      </div>

      <HomeButton isIcon />
    </div>
  );
}
