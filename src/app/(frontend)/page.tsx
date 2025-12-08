import Block from "@/components/Block";
import CutoffText from "@/components/CutoffText";
import DynamicBackground from "@/components/DynamicBackground";
import Section from "@/components/Section";
import { pages } from "@/lib/pages";
import { getPayloadClient } from "@/lib/payload";
import type { Category, LandingPage } from "@/lib/store";
import Link from "next/link";
import { Suspense } from "react";

// Use dynamic rendering for pages that need database access
export const dynamic = "force-dynamic";

const Header = async () => {
  const payload = await getPayloadClient();

  const categoriesResult = await payload.find({
    collection: "categories",
    depth: 2,
    limit: 100,
  });

  const categories = categoriesResult.docs as unknown as Category[];

  const data = categories.map((category) => ({
    category,
    desktopUrl: category.headerDesktop?.url,
    mobileUrl: category.headerMobile?.url,
  }));

  return <DynamicBackground data={data} />;
};

const About = async () => {
  const payload = await getPayloadClient();

  const landingPage = (await payload.findGlobal({
    slug: "landing-page" as "site-settings",
  })) as unknown as LandingPage;

  const abouts = landingPage.abouts || [];

  return (
    <Section className="pt-12">
      <div className="flex flex-col 2xl:flex-row justify-between items-start lg:items-end leading-10">
        <div className="px-10 2xl:p-0">
          <CutoffText>ABOUT</CutoffText>
        </div>

        <div className="flex flex-col gap-10 py-0 px-10 w-full">
          {abouts.map((about) => (
            <div key={about.title} className="flex flex-col gap-2">
              <p className="text-4xl sm:text-7xl font-bold">{about.title}</p>
              <Block content={about.content} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

const Footer = async () => {
  const payload = await getPayloadClient();

  const landingPage = (await payload.findGlobal({
    slug: "landing-page" as "site-settings",
    depth: 2,
  })) as unknown as LandingPage;

  const socials = landingPage.socials || [];
  const bgImageUrl = landingPage.footerImage?.url;

  return (
    <Section
      className="h-[450px] flex flex-col justify-end items-start px-5 sm:px-10"
      style={{
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        id="footer"
        className="flex flex-col justify-end items-start gap-10 mr-10 mb-10"
      >
        <div className="flex flex-col sm:flex-row font-bold gap-10">
          {socials.map((social) => (
            <div key={social.key} className="flex flex-col text-start">
              <p>{social.key}</p>
              <a
                href={social.url}
                target="_blank"
                className="hover:opacity-70 transition-all duration-500 "
              >
                {social.value}
              </a>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="hover:opacity-70 transition-all duration-500"
            >
              {page.title}
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default async function Landing() {
  return (
    <Suspense>
      <Header />
      <About />
      <Footer />
    </Suspense>
  );
}
