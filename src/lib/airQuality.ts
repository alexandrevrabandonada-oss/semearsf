export type PollutantKind = "pm25" | "pm10";

export type OmsLevel = "bom" | "moderado" | "alto" | "muito alto";

type OmsBand = {
  max: number;
  level: OmsLevel;
  icon: string;
  summary: string;
  recommendation: string;
};

const OMS_BANDS: Record<PollutantKind, OmsBand[]> = {
  pm25: [
    { max: 15, level: "bom", icon: "OK", summary: "Dentro da faixa recomendada.", recommendation: "Atividades ao ar livre podem seguir normalmente." },
    { max: 37.5, level: "moderado", icon: "!", summary: "Acima do ideal, mas ainda moderado.", recommendation: "Pessoas sensiveis podem preferir reduzir esforco ao ar livre." },
    { max: 75, level: "alto", icon: "!!", summary: "Concentracao alta para exposicao prolongada.", recommendation: "Considere pausas e menor tempo de exposicao externa." },
    { max: Number.POSITIVE_INFINITY, level: "muito alto", icon: "!!!", summary: "Concentracao muito alta no momento.", recommendation: "Evite esforco intenso ao ar livre ate nova avaliacao." }
  ],
  pm10: [
    { max: 45, level: "bom", icon: "OK", summary: "Dentro da faixa recomendada.", recommendation: "Atividades ao ar livre podem seguir normalmente." },
    { max: 100, level: "moderado", icon: "!", summary: "Acima do ideal, mas ainda moderado.", recommendation: "Pessoas sensiveis podem preferir reduzir esforco ao ar livre." },
    { max: 150, level: "alto", icon: "!!", summary: "Concentracao alta para exposicao prolongada.", recommendation: "Considere pausas e menor tempo de exposicao externa." },
    { max: Number.POSITIVE_INFINITY, level: "muito alto", icon: "!!!", summary: "Concentracao muito alta no momento.", recommendation: "Evite esforco intenso ao ar livre ate nova avaliacao." }
  ]
};

export type OmsClassification = {
  pollutant: PollutantKind;
  value: number | null;
  unit: "ug/m3";
  level: OmsLevel | "sem dados";
  icon: string;
  summary: string;
  recommendation: string;
};

export function classifyOmsPollutant(pollutant: PollutantKind, value: number | null | undefined): OmsClassification {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return {
      pollutant,
      value: null,
      unit: "ug/m3",
      level: "sem dados",
      icon: "?",
      summary: "Sem leitura valida para classificar.",
      recommendation: "Aguardando nova medicao para orientar cuidados."
    };
  }

  const band = OMS_BANDS[pollutant].find((item) => value <= item.max) ?? OMS_BANDS[pollutant][OMS_BANDS[pollutant].length - 1];
  return {
    pollutant,
    value,
    unit: "ug/m3",
    level: band.level,
    icon: band.icon,
    summary: band.summary,
    recommendation: band.recommendation
  };
}

export function isAboveOmsThreshold(pm25: number | null | undefined, pm10: number | null | undefined): boolean {
  const pm25Value = typeof pm25 === "number" && Number.isFinite(pm25) ? pm25 : null;
  const pm10Value = typeof pm10 === "number" && Number.isFinite(pm10) ? pm10 : null;
  return (pm25Value !== null && pm25Value > 15) || (pm10Value !== null && pm10Value > 45);
}
