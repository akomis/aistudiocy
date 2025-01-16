import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <Spinner />
    </div>
  );
}
