import { Link } from "react-router-dom";

const ctas = [
  { href: "/dados", label: "Ver dados agora", tone: "bg-cta text-base hover:bg-cta/90" },
  { href: "/agenda", label: "Ver agenda", tone: "bg-ciano text-base hover:bg-ciano/90" },
  { href: "/inscricoes", label: "Participar", tone: "bg-primaria text-base hover:bg-primaria/90" }
];

export function HomePage() {
  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-primaria/60 bg-fundo/90 p-8 shadow-[0_0_0_1px_rgba(24,165,114,0.25)] md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ciano">Portal SEMEAR</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-texto md:text-5xl">
          Informacoes publicas, agenda e inscricoes em um unico lugar.
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-texto/90 md:text-base">
          [Placeholder] Esta pagina inicial apresenta acessos rapidos. O conteudo editorial oficial sera inserido
          pela equipe de coordenacao.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {ctas.map((cta) => (
            <Link
              className={`rounded-lg px-5 py-3 text-sm font-black uppercase tracking-wide transition-transform hover:-translate-y-0.5 ${cta.tone}`}
              key={cta.href}
              to={cta.href}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-acento/60 bg-base/90 p-6">
        <h2 className="text-lg font-bold text-cta">[Placeholder] Destaques</h2>
        <p className="mt-2 text-sm text-texto/90">
          Nenhum dado real foi inserido aqui. Esta area esta pronta para cards de indicadores, noticias e avisos
          oficiais.
        </p>
      </div>
    </section>
  );
}
