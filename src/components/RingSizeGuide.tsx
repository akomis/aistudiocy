import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function RingSizeGuide() {
  const t = useTranslations("Common");

  return (
    <Link
      href="/ring-size"
      target="_blank"
      className="text-2xl md:text-4xl font-bold hover:cursor-pointer hover:opacity-75 transition-all"
    >
      {t("ringSizeGuide")}
    </Link>
  );
}
