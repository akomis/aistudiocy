import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
  className?: string;
};

const Logo = ({ className }: Props) => {
  return (
    <div className="flex items-center">
      <Image
        className={cn("w-[50px]", className)}
        src="/logo.png"
        alt="aistudiocy"
        width={209}
        height={415}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
};

export default Logo;
