import HomeButton from "@/components/HomeButton";
import { Label } from "@radix-ui/react-label";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-10">
      <div>
        <Label className="text-2xl">
          You seem to be lost but you can always go back to{" "}
        </Label>
        <HomeButton />
      </div>

      <HomeButton isIcon />
    </div>
  );
}
