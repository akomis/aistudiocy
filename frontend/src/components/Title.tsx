type Props = {
  children: React.ReactNode;
};

export default function Title({ children }: Props) {
  return <p className="text-6xl font-bold">{children}</p>;
}
