import { Link } from "react-router-dom";

export function PrivacidadeLgpdPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-black text-text-primary md:text-3xl">Privacidade e LGPD</h1>
        <p className="mt-3 text-sm text-text-secondary md:text-base">
          Compromissos publicos do SEMEAR com privacidade, uso responsavel de dados e transparencia.
        </p>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-text-primary">Como tratamos dados</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Coletamos somente dados necessarios para funcionamento da plataforma e inscricoes publicas.</li>
          <li>Dados ambientais publicados em <Link className="font-semibold text-brand-primary underline" to="/dados">/dados</Link> sao de interesse coletivo e nao identificam pessoas.</li>
          <li>Dados de contato enviados em formularios sao usados apenas para retorno institucional e organizacao de atividades.</li>
          <li>Voce pode solicitar revisao, correcao ou exclusao de dados pessoais pelos canais oficiais.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-text-primary">Participacao com seguranca</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary md:text-base">
          <li>Use <Link className="font-semibold text-brand-primary underline" to="/agenda">/agenda</Link> para inscricoes em atividades com informacoes claras de uso de dados.</li>
          <li>No <Link className="font-semibold text-brand-primary underline" to="/conversar">/conversar</Link>, evite publicar informacoes pessoais sensiveis em texto aberto.</li>
          <li>Alertas em <Link className="font-semibold text-brand-primary underline" to="/alertas">/alertas</Link> usam somente dados tecnicos necessarios para envio.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-brand-primary-soft p-6">
        <h2 className="text-lg font-black text-brand-primary">Acessibilidade e contato</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-primary">
          <li>Se preferir, envie sua solicitacao em linguagem simples e a equipe retorna com orientacao objetiva.</li>
          <li>Canal de privacidade e direitos LGPD: <a className="font-semibold text-brand-primary underline" href="mailto:contato@semear.uff.br">contato@semear.uff.br</a>.</li>
          <li>Para contexto institucional do projeto, veja tambem a pagina <Link className="font-semibold text-brand-primary underline" to="/sobre">Sobre</Link>.</li>
        </ul>
      </section>
    </div>
  );
}