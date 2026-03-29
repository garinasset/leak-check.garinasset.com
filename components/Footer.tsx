import { ReactNode } from "react";
import React from "react";

interface FooterProps {
  children: ReactNode;
  separator?: string;
}

export default function Footer({ children, separator = "|" }: FooterProps) {
  const childArray = React.Children.toArray(children);

  return (
    <footer className="mt-auto w-full px-4 py-6">
      <div className="mx-auto flex max-w-[52rem] flex-row justify-center items-center text-center text-[0.75rem] leading-5">
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="mx-1 text-gray-400">{separator}</span>}
            <div className="px-2">{child}</div>
          </React.Fragment>
        ))}
      </div>
    </footer>
  );
}
