import HomeButton from "@/components/HomeButton";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("Errors");

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-10">
      <div>
        <div className="text-2xl">{t("notFound")}</div>
      </div>

      <HomeButton isIcon />
    </div>
  );
}
