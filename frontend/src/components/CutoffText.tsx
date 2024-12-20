type Props = {
  children: React.ReactNode;
};

export default function CutoffText({ children }: Props) {
  return (
    <div className="h-[67px] sm:h-[140px] overflow-hidden">
      <span className="text-7xl sm:text-[9rem] font-bold tracking-widest">
        {children}
      </span>
    </div>
  );
}
