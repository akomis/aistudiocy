"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FulfillmentButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFulfill = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillmentStatus: "fulfilled" }),
        credentials: "include",
      });

      if (res.ok) {
        router.refresh();
        // Keep loading state until refresh completes and component unmounts
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to update fulfillment status:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFulfill}
      disabled={loading}
      className="flex items-center gap-1 px-3 py-1.5 rounded text-sm bg-[var(--theme-elevation-200)] hover:bg-[var(--theme-elevation-300)] transition-colors disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Updating...
        </>
      ) : (
        <>
          <Check size={14} />
          Fullfill
        </>
      )}
    </button>
  );
}
