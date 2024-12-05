import Section from "../components/Section";
import Block from "@/components/Block";
import DynamicBackground from "@/components/DynamicBackground";
import { get } from "@/lib/strapi";
import Link from "next/link";

const Header = async () => {
  const headers = (await get("headers")).data;

  return <DynamicBackground data={headers} />;
};

const About = async () => {
  const abouts = (await get("abouts")).data;

  return (
    <Section>
      <div className="flex flex-col lg:flex-row justify-between items-end">
        <div className="h-[110px] overflow-hidden">
          <span className="text-9xl font-bold lg:self-end">ABOUT</span>
        </div>
        <div className="flex flex-col gap-10 py-20 px-10">
          {abouts.map((about: any) => (
            <div key={about.Title} className="flex flex-col gap-2">
              <p className="text-6xl font-bold">{about.Title}</p>
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
      className="h-[450px] flex flex-col justify-end items-end"
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

        <div className="flex flex-col sm:flex-row font-thin gap-10 text-sm">
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
    <>
      <Header />
      <About />
      <Footer />
    </>
  );
}
