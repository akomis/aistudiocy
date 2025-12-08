"use client";

import Image from "next/image";

// Simple Lexical content renderer for frontend
// Payload stores rich text as Lexical JSON format
export default function Block({ content }: { readonly content: any }) {
  if (!content || !content.root || !content.root.children) return null;

  return (
    <div className="prose prose-invert max-w-none">
      {renderNodes(content.root.children)}
    </div>
  );
}

function renderNodes(nodes: any[]): React.ReactNode[] {
  return nodes.map((node, index) => renderNode(node, index));
}

function renderNode(node: any, key: number): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="leading-6 text-justify">
          {node.children ? renderNodes(node.children) : null}
        </p>
      );

    case "heading": {
      const level = node.tag || 1;
      const headingClasses: Record<number, string> = {
        1: "text-6xl mb-10",
        2: "text-5xl mb-5",
        3: "text-3xl mb-4",
        4: "text-2xl mb-2",
        5: "text-lg mb-2",
        6: "text-md mb-2",
      };
      const className = headingClasses[level] || "text-sm mb-2";
      const children = node.children ? renderNodes(node.children) : null;
      switch (level) {
        case 1:
          return (
            <h1 key={key} className={className}>
              {children}
            </h1>
          );
        case 2:
          return (
            <h2 key={key} className={className}>
              {children}
            </h2>
          );
        case 3:
          return (
            <h3 key={key} className={className}>
              {children}
            </h3>
          );
        case 4:
          return (
            <h4 key={key} className={className}>
              {children}
            </h4>
          );
        case 5:
          return (
            <h5 key={key} className={className}>
              {children}
            </h5>
          );
        default:
          return (
            <h6 key={key} className={className}>
              {children}
            </h6>
          );
      }
    }

    case "text":
      let text: React.ReactNode = node.text;
      if (node.format & 1) text = <strong>{text}</strong>; // bold
      if (node.format & 2) text = <em>{text}</em>; // italic
      if (node.format & 4) text = <s>{text}</s>; // strikethrough
      if (node.format & 8) text = <u>{text}</u>; // underline
      if (node.format & 16) text = <code>{text}</code>; // code
      return <span key={key}>{text}</span>;

    case "link":
      return (
        <a
          key={key}
          href={node.fields?.url || "#"}
          target={node.fields?.newTab ? "_blank" : undefined}
          rel={node.fields?.newTab ? "noopener noreferrer" : undefined}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {node.children ? renderNodes(node.children) : null}
        </a>
      );

    case "list":
      const ListTag = node.listType === "number" ? "ol" : "ul";
      return (
        <ListTag key={key} className="list-inside mb-4">
          {node.children ? renderNodes(node.children) : null}
        </ListTag>
      );

    case "listitem":
      return (
        <li key={key} className="mb-1">
          {node.children ? renderNodes(node.children) : null}
        </li>
      );

    case "quote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-gray-500 pl-4 italic my-4"
        >
          {node.children ? renderNodes(node.children) : null}
        </blockquote>
      );

    case "upload":
      if (node.value?.url) {
        return (
          <Image
            key={key}
            src={node.value.url}
            width={node.value.width || 800}
            height={node.value.height || 600}
            alt={node.value.alt || ""}
            className="my-4"
          />
        );
      }
      return null;

    case "linebreak":
      return <br key={key} />;

    default:
      // For any other node types with children, render them
      if (node.children) {
        return <span key={key}>{renderNodes(node.children)}</span>;
      }
      return null;
  }
}
