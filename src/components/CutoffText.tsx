type Props = {
  children: React.ReactNode;
};

export default function CutoffText({ children }: Props) {
  return (
    <div className="h-[62px] sm:h-[125px] font-black overflow-hidden min-w-fit">
      <span className="text-7xl sm:text-[9rem] tracking-[10px]">
        {children}
      </span>
    </div>
  );
}
