import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type { AcervoCollection, ReportDocument, StationOverview } from "../lib/api";

type DemoLink = {
  title: string;
  description: string;
  href: string;
  ready: boolean;
};

export function ApresentacaoPage() {
  const now = useMemo(() => new Date(), []);
  const [pilotStation, setPilotStation] = useState<StationOverview | null>(null);
  const [featuredCollection, setFeaturedCollection] = useState<AcervoCollection | null>(null);
  const [featuredReport, setFeaturedReport] = useState<ReportDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [monitoringApi, contentApi] = await Promise.all([
          import("../lib/api/monitoring"),
          import("../lib/api/content")
        ]);

        const [stations, collections, reports] = await Promise.all([
          monitoringApi.getStationOverview(),
          contentApi.listFeaturedCollections(1),
          contentApi.listReports({ limit: 12 })
        ]);

        if (cancelled) return;

        const onlineFirstStation = stations.find((station) => station.is_online) ?? stations[0] ?? null;
        const firstFeaturedReport = reports.find((report) => report.featured) ?? reports[0] ?? null;

        setPilotStation(onlineFirstStation);
        setFeaturedCollection(collections[0] ?? null);
        setFeaturedReport(firstFeaturedReport);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const bulletinHref = `/status?year=${year}&month=${month}`;
  const transparencyHref = `/transparencia?year=${year}&month=${month}`;

  const links: DemoLink[] = [
    {
      title: "Ver dados da estacao piloto",
      description: pilotStation
        ? `Abre o painel publico ja focado em ${pilotStation.name}.`
        : "Abre o painel de dados; a estacao piloto aparece quando houver estacao carregada.",
      href: pilotStation?.code ? `/dados?station=${pilotStation.code}` : "/dados",
      ready: Boolean(pilotStation)
    },
    {
      title: "Abrir 1 dossie featured",
      description: featuredCollection
        ? `Vai direto para o dossie ${featuredCollection.title}.`
        : "Abre a area de dossies para demonstracao publica.",
      href: featuredCollection ? `/dossies/${featuredCollection.slug}` : "/dossies",
      ready: Boolean(featuredCollection)
    },
    {
      title: "Abrir boletim do mes",
      description: `Leva ao boletim operacional de ${month}/${year}, pronto para exportar e compartilhar.`,
      href: bulletinHref,
      ready: true
    },
    {
      title: "Abrir transparencia filtrada",
      description: `Mostra os gastos de ${month}/${year} com filtros aplicados na URL.`,
      href: transparencyHref,
      ready: true
    },
    {
      title: "Abrir relatorio featured",
      description: featuredReport
        ? `Abre o documento ${featuredReport.title}.`
        : "Abre a biblioteca de relatorios para demonstracao.",
      href: featuredReport ? `/relatorios/${featuredReport.slug}` : "/relatorios",
      ready: Boolean(featuredReport)
    }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border-subtle bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Modo apresentacao</p>
        <h1 className="mt-2 text-2xl font-black text-text-primary md:text-3xl">Roteiro rapido para demonstracao publica</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary md:text-base">
          Esta pagina organiza atalhos para uma apresentacao institucional do portal. Use os cards abaixo para abrir os pontos
          mais importantes sem depender de navegacao manual durante a demonstracao.
        </p>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-brand-primary-soft p-6 shadow-sm">
        <h2 className="text-lg font-black text-brand-primary">Como usar</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-primary md:text-base">
          <li>Comece pelos dados da estacao piloto para mostrar operacao em tempo quase real.</li>
          <li>Em seguida, abra um dossie e um relatorio para demonstrar memoria e producao editorial.</li>
          <li>Finalize com o boletim mensal e a transparencia filtrada para reforcar prestacao de contas.</li>
        </ul>
      </section>

      <section>
        <h2 className="sr-only">Atalhos de demonstracao</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {links.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group flex min-h-[220px] flex-col justify-between rounded-2xl border border-border-subtle bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
                    {item.ready ? "Pronto" : "Fallback"}
                  </span>
                  <span className="text-lg" aria-hidden="true">↗</span>
                </div>
                <h3 className="mt-4 text-xl font-black text-text-primary group-hover:text-brand-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.description}</p>
              </div>
              <span className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-text-secondary">Abrir atalho</span>
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-text-secondary" role="status" aria-live="polite">Carregando atalhos de demonstracao...</p>
      ) : null}
    </div>
  );
}
