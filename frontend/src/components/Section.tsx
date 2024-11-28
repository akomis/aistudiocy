import { cn } from "@/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Section({ children, className }: Props) {
  return <section className={cn("", className)}>{children}</section>;
}
