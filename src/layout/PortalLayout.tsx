import { type PropsWithChildren } from "react";

import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export function PortalLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-bg-page">
      {/* Skip Link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-primary focus:px-6 focus:py-3 focus:text-base focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-primary"
      >
        Ir para o conteúdo principal
      </a>
      <Navbar />
      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-44 md:px-6 md:pt-44">{children}</main>
      <Footer />
    </div>
  );
}
