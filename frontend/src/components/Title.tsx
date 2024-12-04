import { Label } from "./ui/label";

type Props = {
  children: React.ReactNode;
};

export default function Title({ children }: Props) {
  return <Label className="text-6xl font-bold">{children}</Label>;
}
