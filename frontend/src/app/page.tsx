import Screen from "../components/Screen";
import Section from "../components/Section";
import Block from "@/components/Block";
import DynamicBackground from "@/components/DynamicBackground";
import { get } from "@/lib/strapi";
import Link from "next/link";

const Header = async () => {
  const getHeader = await get("headers");

  return <DynamicBackground data={getHeader.data} />;
};

const About = async () => {
  const data = await get("abouts");

  if (!data) return null;

  const abouts = data.data;

  return (
    <Section>
      <div className="flex flex-col lg:flex-row justify-between items-end">
        <div className="h-[110px] overflow-hidden">
          <span className="text-9xl font-bold lg:self-end">ABOUT</span>
        </div>
        <div className="flex flex-col gap-10 p-10">
          {abouts.map((about: any) => (
            <div key={about.Title} className="flex flex-col gap-2">
              <p className="text-5xl font-bold">{about.Title}</p>
              <Block content={about.Content} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

const Footer = async () => {
  const getSocials = await get("socials");
  const getFooter = await get("image");
  const getPages = await get("pages");

  if (!getSocials?.data) return null;
  if (!getFooter?.data) return null;

  const socials = getSocials.data;
  const footer = getFooter.data.Footer;
  const pages = getPages.data;
  const bgImageUrl = footer?.url;

  return (
    <Section
      className="h-[400px] flex flex-col justify-end items-end"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col justify-end items-end gap-10 mr-10 mb-10">
        <div className="flex flex-col sm:flex-row font-bold gap-10">
          {socials.map((social: any) => (
            <div key={social.Key} className="flex flex-col">
              <p>{social.Key}</p>
              <a
                href={social.URL}
                target="_blank"
                className="hover:text-gray-400"
              >
                {social.Value}
              </a>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row font-thin gap-10 ">
          {pages.map((page: any) => (
            <Link
              key={page.Key}
              href={`/${page.Key}`}
              target="_blank"
              className="hover:cursor-pointer hover:text-gray-300"
            >
              {page.Title}
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default async function Home() {
  return (
    <Screen>
      <Header />
      <About />
      <Footer />
    </Screen>
  );
}
