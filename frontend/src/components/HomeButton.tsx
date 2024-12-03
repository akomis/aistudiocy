import Link from "next/link";
import { Label } from "./ui/label";

export default function HomeButton() {
  return (
    <Link href="/">
      <Label className="text-xl hover:cursor-pointer hover:text-gray-300 transform transition-all">
        HOME
      </Label>
    </Link>
  );
}
