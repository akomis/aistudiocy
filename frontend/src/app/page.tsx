"use client";

import useStrapi from "@/hooks/useStrapi";
import Screen from "../components/Screen";
import Section from "../components/Section";
import { ApiAboutAbout, ApiSocialSocial } from "@/types/generated/contentTypes";
import { StrapiAttributes } from "@/types/strapi";
import Block from "@/components/Block";

const About = () => {
  const { data } = useStrapi("abouts");

  if (!data) return null;

  const abouts = data.data as StrapiAttributes<ApiAboutAbout>;

  return (
    <Section>
      <div className="flex gap-20 items-end">
        <p className="text-9xl font-bold">ABOUT</p>
        <div className="flex flex-col gap-10 m-10">
          {abouts.map((about) => (
            <div key={about.Title} className="flex flex-col gap-2">
              <p className="text-4xl font-bold">{about.Title}</p>
              <Block content={about.Content} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

const Footer = () => {
  const { data } = useStrapi("socials");

  if (!data) return null;

  const socials = data.data as StrapiAttributes<ApiSocialSocial>;

  return (
    <Section className="h-[200px] flex justify-end items-end">
      <div className="flex font-bold gap-10 mr-10 mb-10">
        {socials.map((social) => (
          <div key={social.Key} className="flex flex-col">
            <p>{social.Key}</p>
            <a href={social.URL} target="_blank">
              {social.Value}
            </a>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default function Home() {
  return (
    <Screen>
      {/* <Section className="h-screen">
        <div>HEADER</div>
      </Section> */}
      <About />
      <Footer />
    </Screen>
  );
}
