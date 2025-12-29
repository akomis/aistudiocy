// https://github.com/vercel/next.js/discussions/50034
// Catch-all route for 404 pages - renders not-found content directly

import HomeButton from "@/components/HomeButton";

export default function NotFoundCatchAll() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-10">
      <div>
        <div className="text-2xl">You seem to be lost.</div>
      </div>

      <HomeButton isIcon />
    </div>
  );
}
