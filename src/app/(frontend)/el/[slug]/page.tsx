import LegalPage, { legalPageMetadata } from "@/components/LegalPage";
import { getAllPageSlugs } from "@/lib/pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return legalPageMetadata("el", slug);
}

export default async function GreekStaticPage({ params }: Props) {
  const { slug } = await params;
  return <LegalPage locale="el" slug={slug} />;
}
