import { type PropsWithChildren } from "react";

import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export function PortalLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-base via-fundo to-base">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-24 md:px-6 md:pt-28">{children}</main>
      <Footer />
    </div>
  );
}
