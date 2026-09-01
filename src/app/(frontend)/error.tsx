"use client";

import HomeButton from "@/components/HomeButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
};

// Thrown when a visitor submits a server action from a page that was rendered
// by a previous deployment. Nothing is broken - the page just needs reloading.
const isStaleDeployment = (error: Error) =>
  error.message.includes("Failed to find Server Action");

export default function Error({ error }: Props) {
  if (isStaleDeployment(error)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-20">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl">This page is out of date.</p>
            <p className="text-2xl">Reload to pick up the latest version.</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>

        <HomeButton isIcon />
      </div>
    );
  }

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
        {/* Show the digest, not error.message - the message can carry internal
            detail (SQL text, stack fragments) and reads as broken to a
            customer. The digest is what correlates with the server log. */}
        {error.digest && (
          <p className="font-thin text-lg max-w-lg">
            Reference: {error.digest}
          </p>
        )}
      </div>

      <HomeButton isIcon />
    </div>
  );
}
