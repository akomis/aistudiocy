"use client";

import useStrapi from "@/hooks/useStrapi";
import Screen from "../components/Screen";
import Section from "../components/Section";

const About = () => {
  const { data } = useStrapi("abouts");

  if (!data) return null;

  return (
    <Section className="py-10 border-2 border-red-500">
      <div className="flex gap-20 items-end">
        <p className="text-4xl">ABOUT</p>
        <div>
          {data.map((about) => (
            <p key={about.id}>{about.description}</p>
          ))}
        </div>
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
      {/* <Section>
        <div>FOOTER</div>
      </Section> */}
    </Screen>
  );
}
