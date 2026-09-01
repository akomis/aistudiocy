"use client";

import HomeButton from "@/components/HomeButton";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Props = {
  error: Error & { digest?: string };
};

// Thrown when a visitor submits a server action from a page that was rendered
// by a previous deployment. Nothing is broken - the page just needs reloading.
const isStaleDeployment = (error: Error) =>
  error.message.includes("Failed to find Server Action");

export default function Error({ error }: Props) {
  const t = useTranslations("Errors");

  if (isStaleDeployment(error)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-20">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl">{t("staleTitle")}</p>
            <p className="text-2xl">{t("staleMessage")}</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t("reload")}
          </Button>
        </div>

        <HomeButton isIcon />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-20">
      <div className="flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-2xl">{t("sorry")}</p>
          <p className="text-2xl">
            {t("contactPrefix")}{" "}
            <Link href="/#footer">{t("contactLink")}</Link>.
          </p>
        </div>
        {/* Show the digest, not error.message - the message can carry internal
            detail (SQL text, stack fragments) and reads as broken to a
            customer. The digest is what correlates with the server log. */}
        {error.digest && (
          <p className="font-thin text-lg max-w-lg">
            {t("reference", { digest: error.digest })}
          </p>
        )}
      </div>

      <HomeButton isIcon />
    </div>
  );
}
