import Contact from "@/components/Contact";
import Logo from "@/components/Logo";
import { getPayloadClient } from "@/lib/payload";
import type { LandingPage } from "@/lib/store";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ConfirmationPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const isSuccess = status === "success";

  const payload = await getPayloadClient();
  const landingPage = (await payload.findGlobal({
    slug: "landing-page",
    depth: 2,
  })) as unknown as LandingPage;

  const socials = landingPage.socials || [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-12 p-8 animate-in fade-in">
      <Link href="/" className="hover:opacity-75 transition-all">
        <Logo className="w-[150px]" />
      </Link>

      {isSuccess ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold tracking-widest">THANK YOU</h1>
          <div>
            <p className="text-xl font-light max-w-md">
              Your order has been placed successfully.
            </p>
            <p className="text-lg font-light text-gray-400">
              You will receive a confirmation email shortly.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-widest">PROBLEM</h1>
          <p className="text-xl font-light max-w-md">
            There was an issue processing your order.
          </p>
          <p className="text-lg font-light text-gray-400 max-w-md">
            Please contact us and we will help you resolve this.
          </p>
          <Contact socials={socials} />
        </div>
      )}
    </div>
  );
}
