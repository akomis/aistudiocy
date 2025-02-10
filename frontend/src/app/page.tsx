import Block from "@/components/Block";
import CutoffText from "@/components/CutoffText";
import DynamicBackground from "@/components/DynamicBackground";
import { sdk } from "@/lib/medusa";
import { get } from "@/lib/strapi";
import Link from "next/link";
import { Suspense } from "react";
import Section from "../components/Section";

export const revalidate = 3600;

const Header = async () => {
  const categories = (await sdk.store.category.list()).product_categories;
  const headers = (await get("headers")).data;

  const data = categories.map((category) => {
    return {
      category: category,
      desktopUrl: headers.find(
        (header: any) =>
          header.Category.toLowerCase() === category.name.toLowerCase()
      )?.Desktop?.url,
      mobileUrl: headers.find(
        (header: any) =>
          header.Category.toLowerCase() === category.name.toLowerCase()
      )?.Mobile?.url,
    };
  });

  return <DynamicBackground data={data} />;
};

const About = async () => {
  const abouts = (await get("abouts")).data;

  return (
    <Section className="pt-12">
      <div className="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-end leading-10">
        <div className="px-10 2xl:p-0">
          <CutoffText>ABOUT</CutoffText>
        </div>

        <div className="flex flex-col gap-10 pt-12 pb-20 px-10 w-full">
          {abouts.map((about: any) => (
            <div key={about.Title} className="flex flex-col gap-2">
              <p className="text-4xl sm:text-7xl font-bold">{about.Title}</p>
              <Block content={about.Content} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

const Footer = async () => {
  const socials = (await get("socials")).data;
  const footer = (await get("image")).data.Footer;
  const pages = (await get("pages")).data;

  const bgImageUrl = footer?.url;

  return (
    <Section
      className="h-[450px] flex flex-col justify-end items-start px-5 sm:px-10"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        id="footer"
        className="flex flex-col justify-end items-start gap-10 mr-10 mb-10"
      >
        <div className="flex flex-col sm:flex-row font-bold gap-10">
          {socials.map((social: any) => (
            <div key={social.Key} className="flex flex-col text-start">
              <p>{social.Key}</p>
              <a
                href={social.URL}
                target="_blank"
                className="hover:opacity-70 transition-all duration-500 "
              >
                {social.Value}
              </a>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row font-normal text-sm text-gray-300 text-start">
          {pages.map((page: any, index: number) => (
            <div key={page.Key}>
              <Link
                href={`/${page.Key}`}
                target="_blank"
                className="hover:cursor-pointer hover:text-white transition-all"
              >
                {page.Title}
              </Link>
              {index < pages.length - 1 && (
                <span className="hidden sm:inline sm:mx-4">|</span>
              )}
            </div>
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
