type Props = {
  children: React.ReactNode;
};

export default function CutoffText({ children }: Props) {
  return (
    <div className="h-[50px] md:h-[110px] overflow-hidden">
      <span className="text-6xl md:text-9xl font-bold lg:self-end tracking-widest">
        {children}
      </span>
    </div>
  );
}
