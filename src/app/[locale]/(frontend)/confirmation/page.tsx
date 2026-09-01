import Contact from "@/components/Contact";
import Logo from "@/components/Logo";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPayloadClient } from "@/lib/payload";
import type { LandingPage } from "@/lib/store";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const { status } = await searchParams;
  const isSuccess = status === "success";

  const t = await getTranslations("Confirmation");

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
          <h1 className="text-4xl font-bold tracking-widest">
            {t("successTitle")}
          </h1>
          <div>
            <p className="text-xl font-light max-w-md">{t("successMessage")}</p>
            <p className="text-lg font-light text-gray-400">
              {t("successNote")}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-widest">
            {t("problemTitle")}
          </h1>
          <p className="text-xl font-light max-w-md">{t("problemMessage")}</p>
          <p className="text-lg font-light text-gray-400 max-w-md">
            {t("problemNote")}
          </p>
          <Contact socials={socials} />
        </div>
      )}
    </div>
  );
}
