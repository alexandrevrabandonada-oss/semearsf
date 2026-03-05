import { NavLink } from "react-router-dom";

const links = [
  { href: "/", label: "Home" },
  { href: "/dados", label: "Dados" },
  { href: "/acervo", label: "Acervo" },
  { href: "/acervo/linha", label: "Linha do tempo" },
  { href: "/blog", label: "Blog" },
  { href: "/agenda", label: "Agenda" },
  { href: "/conversar", label: "Conversar" },
  { href: "/dossies", label: "Dossiês" },
  { href: "/inscricoes", label: "Inscricoes" },
  { href: "/sobre", label: "Sobre" },
  { href: "/transparencia", label: "Transparencia" }
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ciano/50 bg-fundo/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <strong className="text-sm font-black uppercase tracking-[0.2em] text-cta md:text-base">
          {import.meta.env.VITE_PROJECT_NAME || "SEMEAR Portal"}
        </strong>
        <ul className="flex flex-wrap items-center justify-end gap-2 text-xs font-semibold md:gap-3 md:text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <NavLink
                className={({ isActive }) =>
                  [
                    "rounded-md px-2 py-1 transition-colors",
                    isActive ? "bg-primaria text-base" : "text-texto hover:bg-ciano/20 hover:text-ciano"
                  ].join(" ")
                }
                to={link.href}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              className="ml-2 rounded-md border border-cta bg-cta/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-cta transition-colors hover:bg-cta hover:text-base"
              onClick={() => {
                alert("Para instalar: no Android, clique nos três pontos e 'Instalar aplicativo'. No iOS, clique em Compartilhar e 'Adicionar à Tela de Início'.");
              }}
              type="button"
            >
              Instalar
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
