import Link from "next/link";
import { Label } from "./ui/label";
import Logo from "./Logo";

type Props = {
  isIcon?: boolean;
};

export default function HomeButton({ isIcon }: Props) {
  return (
    <Link href="/">
      {isIcon ? (
        <Logo />
      ) : (
        <Label className="text-xl hover:cursor-pointer hover:text-gray-300 transform transition-all">
          HOME
        </Label>
      )}
    </Link>
  );
}
