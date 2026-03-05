type ContrastPair = {
  name: string;
  foreground: string;
  background: string;
  minRatio?: number;
};

export type ContrastAuditResult = ContrastPair & {
  ratio: number;
  passes: boolean;
};

const AA_NORMAL_TEXT = 4.5;

const designPairs: ContrastPair[] = [
  { name: "text-primary on bg-surface", foreground: "#16324F", background: "#FFFFFF" },
  { name: "text-secondary on bg-surface", foreground: "#44515F", background: "#FFFFFF" },
  { name: "text-primary on bg-page", foreground: "#16324F", background: "#F7FAFC" },
  { name: "brand-primary on bg-surface", foreground: "#005DAA", background: "#FFFFFF" },
  { name: "brand-primary-dark on brand-primary-soft", foreground: "#16324F", background: "#DCEAF7" },
  { name: "white on brand-primary", foreground: "#FFFFFF", background: "#005DAA" },
  { name: "white on success", foreground: "#FFFFFF", background: "#137333" },
  { name: "white on danger", foreground: "#FFFFFF", background: "#B3261E" },
  { name: "accent-brown on brand-primary-soft", foreground: "#6B3E2E", background: "#DCEAF7" }
];

function normalizeHex(hex: string): string {
  const trimmed = hex.trim().replace(/^#/, "");
  if (trimmed.length === 3) {
    return trimmed
      .split("")
      .map((c) => `${c}${c}`)
      .join("")
      .toLowerCase();
  }
  return trimmed.toLowerCase();
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex);
  if (!/^[0-9a-f]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return [r, g, b];
}

function linearize(channel: number): number {
  const srgb = channel / 255;
  if (srgb <= 0.03928) return srgb / 12.92;
  return ((srgb + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getContrastAuditResults(): ContrastAuditResult[] {
  return designPairs.map((pair) => {
    const ratio = contrastRatio(pair.foreground, pair.background);
    const minRatio = pair.minRatio ?? AA_NORMAL_TEXT;
    return {
      ...pair,
      ratio,
      passes: ratio >= minRatio
    };
  });
}

export function runDevContrastAudit(): void {
  if (!import.meta.env.DEV) return;

  getContrastAuditResults().forEach((pair) => {
    const minRatio = pair.minRatio ?? AA_NORMAL_TEXT;
    if (!pair.passes) {
      console.warn(
        `[a11y][contrast] WARN ${pair.name} ratio=${pair.ratio.toFixed(2)} expected>=${minRatio.toFixed(2)} (${pair.foreground} on ${pair.background})`
      );
    }
  });
}
