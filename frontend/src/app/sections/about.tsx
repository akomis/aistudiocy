import Block from "@/components/Block";
import Section from "@/components/Section";
import useStrapi from "@/hooks/useStrapi";

const About = () => {
  const { data } = useStrapi("abouts");

  const abouts = data?.data;

  if (!abouts) return null;

  return (
    <Section className="py-10 border-2 border-red-500">
      <div className="flex gap-20 items-end">
        <p className="text-4xl">ABOUT</p>
        <div className="flex flex-col gap-10">
          {abouts.map((about: any) => (
            <div key={about?.Title} className="flex flex-col gap-2">
              <p className="text-4xl">{about?.Title}</p>
              <Block content={about?.Content} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default About;
