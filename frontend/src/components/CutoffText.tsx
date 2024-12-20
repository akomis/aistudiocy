type Props = {
  children: React.ReactNode;
};

export default function CutoffText({ children }: Props) {
  return (
    <div className="h-[52px] sm:h-[82px] md:h-[140px] overflow-hidden">
      <span className="text-6xl sm:text-8xl md:text-[10rem] font-bold tracking-widest">
        {children}
      </span>
    </div>
  );
}
