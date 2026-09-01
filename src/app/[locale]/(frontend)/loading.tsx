import Logo from "@/components/Logo";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <Logo className="animate-pulse" />
    </div>
  );
}
