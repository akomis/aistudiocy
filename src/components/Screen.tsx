import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Screen({ children, className }: Props) {
  return (
    <div className={cn("p-10 md:p-20 flex flex-col gap-20", className)}>
      {children}
    </div>
  );
}
