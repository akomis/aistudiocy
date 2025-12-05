import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface BaseProps {
  preview?: string;
  children: React.ReactNode;
}

export const Base: React.FC<BaseProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-black text-white my-auto mx-auto font-sans px-2">
          <Img
            alt="φως logo"
            className="mx-auto p-10"
            height={100}
            src={`https://${process.env.MINIO_ENDPOINT}/assets/logo.png`}
          />
          <Container className="border border-solid border-[#eaeaea] rounded mx-auto px-10 py-4 max-w-[500px] w-full">
            <div className="max-w-full break-words">{children}</div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
