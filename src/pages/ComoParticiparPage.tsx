import { Link } from "react-router-dom";

const participationLinks = [
  { href: "/agenda", label: "Inscricoes e agenda" },
  { href: "/conversar", label: "Conversar" },
  { href: "/alertas", label: "Receber alertas" },
  { href: "/dados", label: "Acompanhar dados" }
];

export function ComoParticiparPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-black text-text-primary md:text-3xl">Como Participar</h1>
        <p className="mt-3 text-sm text-text-secondary md:text-base">
          Formas simples de participar das atividades publicas e acompanhar os resultados do projeto.
        </p>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-text-primary">Canais de participacao</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Inscreva-se nas atividades da agenda para oficinas, rodas de conversa e encontros tecnicos.</li>
          <li>Use o canal Conversar para enviar relatos, perguntas e contribuicoes da sua comunidade.</li>
          <li>Ative alertas para receber avisos de qualidade do ar diretamente no seu dispositivo.</li>
          <li>Acompanhe o painel de dados para monitorar tendencias e apoiar debates publicos.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-text-primary">Atalhos</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {participationLinks.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="inline-flex rounded-full border border-border-subtle px-3 py-1 text-xs font-semibold text-brand-primary transition hover:bg-brand-primary-soft"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-brand-primary-soft p-6">
        <h2 className="text-lg font-black text-brand-primary">Acessibilidade e contato</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-primary">
          <li>Conteudo pensado para leitura objetiva, com linguagem simples e estrutura por blocos.</li>
          <li>Se precisar de suporte para participar de atividades, escreva para <a className="font-semibold text-brand-primary underline" href="mailto:contato@semear.uff.br">contato@semear.uff.br</a>.</li>
          <li>Tambem e possivel acompanhar atualizacoes de situacao em <Link className="font-semibold text-brand-primary underline" to="/status">/status</Link>.</li>
        </ul>
      </section>
    </div>
  );
}