type Props = {
  children: React.ReactNode;
};

export default function CutoffText({ children }: Props) {
  return (
    <div className="h-[60px] sm:h-[108px] overflow-hidden">
      <span className="text-7xl sm:text-9xl font-bold lg:self-end tracking-widest">
        {children}
      </span>
    </div>
  );
}
