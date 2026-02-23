import { NavLink } from "react-router-dom";

const links = [
  { href: "/", label: "Home" },
  { href: "/dados", label: "Dados" },
  { href: "/agenda", label: "Agenda" },
  { href: "/inscricoes", label: "Inscricoes" },
  { href: "/sobre", label: "Sobre" },
  { href: "/transparencia", label: "Transparencia" }
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ciano/50 bg-fundo/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <strong className="text-sm font-black uppercase tracking-[0.2em] text-cta md:text-base">
          SEMEAR Portal
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
        </ul>
      </nav>
    </header>
  );
}
