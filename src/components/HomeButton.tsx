import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import { Label } from "./ui/label";

type Props = {
  isIcon?: boolean;
  href?: string;
};

export default function HomeButton({ isIcon, href = "/" }: Props) {
  return (
    <Link href={href}>
      {isIcon ? (
        <Logo className="hover:opacity-75 transition-all h-20" />
      ) : (
        <Label className="text-xl hover:cursor-pointer hover:opacity-75 transform transition-all">
          <ArrowLeft />
        </Label>
      )}
    </Link>
  );
}
