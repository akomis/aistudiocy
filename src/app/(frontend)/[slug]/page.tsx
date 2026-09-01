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
  return legalPageMetadata("en", slug);
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;
  return <LegalPage locale="en" slug={slug} />;
}
