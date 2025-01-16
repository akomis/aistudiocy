import HomeButton from "@/components/HomeButton";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-10">
      <div>
        <div className="text-2xl">
          You seem to be lost but you can always go back to{" "}
        </div>
        <HomeButton />
      </div>

      <HomeButton isIcon />
    </div>
  );
}
