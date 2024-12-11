type Props = {
  children: React.ReactNode;
};

export default function CutoffText({ children }: Props) {
  return (
    <div className="h-[82px] sm:h-[110px] lg:h-[140px] overflow-hidden">
      <span className="text-8xl sm:text-9xl lg:text-[10rem] font-bold lg:self-end tracking-widest">
        {children}
      </span>
    </div>
  );
}
