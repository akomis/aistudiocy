import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Screen({ children, className }: Props) {
  return <div className={cn("", className)}>{children}</div>;
}
