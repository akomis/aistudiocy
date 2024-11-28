import { cn } from "@/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Section({ children, className }: Props) {
  return (
    <section className={cn("border-2 border-red-400", className)}>
      {children}
    </section>
  );
}
