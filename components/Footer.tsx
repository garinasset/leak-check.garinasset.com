import { ReactNode } from "react";

interface FooterProps {
  children: ReactNode;
}

export default function Footer({ children }: FooterProps) {
  return (
    <footer className="mt-auto w-full px-4 py-6">
      <div className="mx-auto flex max-w-[52rem] flex-col items-center gap-1 text-center text-[0.75rem] leading-5">
        {children}
      </div>
    </footer>
  );
}
