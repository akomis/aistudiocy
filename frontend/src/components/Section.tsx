import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Section({ children, className, style }: Props) {
  return (
    <section className={cn("", className)} style={style}>
      {children}
    </section>
  );
}
