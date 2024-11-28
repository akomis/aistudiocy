import Screen from "../components/Screen";
import Section from "../components/Section";

export default function Home() {
  return (
    <Screen>
      <Section className="h-screen">
        <div>HEADER</div>
      </Section>
      <Section>
        <div>ABOUT</div>
      </Section>
      <Section>
        <div>FOOTER</div>
      </Section>
    </Screen>
  );
}
