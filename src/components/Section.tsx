import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

// Sections fade in on mount, in CSS. This deliberately does not wait for the
// section to scroll into view: the legal pages are a single section many
// screens tall, and a viewport-based reveal leaves them invisible on phones.
export default function Section({ children, className, style }: Props) {
  return (
    <section
      className={cn("animate-in fade-in duration-1000", className)}
      style={style}
    >
      {children}
    </section>
  );
}
