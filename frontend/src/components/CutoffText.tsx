type Props = {
  children: React.ReactNode;
};

export default function CutoffText({ children }: Props) {
  return (
    <div className="h-[82px] sm:h-[110px] overflow-hidden">
      <span className="text-8xl sm:text-9xl font-bold lg:self-end tracking-widest">
        {children}
      </span>
    </div>
  );
}
