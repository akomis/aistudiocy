type Props = {
  children: React.ReactNode;
};

export default function Screen({ children }: Props) {
  return <div className="border-2 border-green-500">{children}</div>;
}
