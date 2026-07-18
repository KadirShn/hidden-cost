export type ReportRow = { label: string; value: string; percent?: string };

export type ProjectReportViewModel = {
  documentTitle: string;
  projectTitle: string;
  generatedAtLabel: string;
  categoryLabel: string;
  category: string;
  currencyLabel: string;
  currency: string;
  ownershipLabel: string;
  ownership: string;
  totalLabel: string;
  total: string;
  monthlyLabel: string;
  monthly: string;
  usageLabel: string;
  usage: string;
  breakdownTitle: string;
  breakdown: ReportRow[];
  assumptionsTitle: string;
  assumptions: ReportRow[];
  financingTitle: string;
  financing?: ReportRow[];
  scenariosTitle: string;
  scenarios: ReportRow[];
  legalTitle: string;
  legalDisclaimer: string;
  appVersionLabel: string;
  appVersion: string;
  engineVersionLabel: string;
  engineVersion: string;
};

export type ComparisonReportViewModel = {
  documentTitle: string;
  generatedAtLabel: string;
  projects: {
    title: string;
    currency: string;
    ownership: string;
    total: string;
    monthly: string;
    usage: string;
  }[];
  headers: {
    project: string;
    currency: string;
    ownership: string;
    total: string;
    monthly: string;
    usage: string;
  };
  warningsTitle: string;
  warnings: string[];
  legalTitle: string;
  legalDisclaimer: string;
  engineVersionLabel: string;
  engineVersion: string;
};

export type ResultCardViewModel = {
  brand: string;
  projectTitle: string;
  totalLabel: string;
  total: string;
  monthlyLabel: string;
  monthly: string;
  usageLabel: string;
  usage: string;
  completenessLabel: string;
  completeness: string;
  disclaimer: string;
};

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const rowHtml = (row: ReportRow) =>
  `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}${row.percent ? ` <span class="muted">(${escapeHtml(row.percent)})</span>` : ''}</td></tr>`;

const baseStyles = `
  @page { size: A4; margin: 28px; }
  * { box-sizing: border-box; }
  body { color: #142025; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; font-size: 12px; line-height: 1.45; margin: 0; }
  h1 { color: #087e72; font-size: 28px; margin: 0 0 8px; }
  h2 { border-bottom: 2px solid #d5dee2; font-size: 16px; margin: 24px 0 10px; padding-bottom: 6px; }
  .subtitle, .muted { color: #5e6c72; }
  .hero { background: #edf8f6; border: 1px solid #9bd4cc; border-radius: 12px; margin: 18px 0; padding: 18px; }
  .hero strong { display: block; font-size: 24px; margin-top: 4px; }
  .metrics { display: flex; gap: 12px; }
  .metric { border: 1px solid #d5dee2; border-radius: 10px; flex: 1; padding: 12px; }
  .metric strong { display: block; font-size: 17px; margin-top: 3px; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border-bottom: 1px solid #e9eef1; padding: 7px 4px; text-align: left; vertical-align: top; }
  th { width: 42%; }
  footer { border-top: 1px solid #d5dee2; color: #5e6c72; font-size: 10px; margin-top: 26px; padding-top: 10px; }
  .avoid-break { break-inside: avoid; }
`;

export function buildProjectReportHtml(model: ProjectReportViewModel): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyles}</style></head><body>
    <header><h1>${escapeHtml(model.documentTitle)}</h1><div class="subtitle">${escapeHtml(model.projectTitle)} · ${escapeHtml(model.generatedAtLabel)}</div></header>
    <section class="hero"><span>${escapeHtml(model.totalLabel)}</span><strong>${escapeHtml(model.total)}</strong></section>
    <section class="metrics"><div class="metric"><span>${escapeHtml(model.monthlyLabel)}</span><strong>${escapeHtml(model.monthly)}</strong></div><div class="metric"><span>${escapeHtml(model.usageLabel)}</span><strong>${escapeHtml(model.usage)}</strong></div></section>
    <section class="avoid-break"><h2>${escapeHtml(model.assumptionsTitle)}</h2><table>${[
      { label: model.categoryLabel, value: model.category },
      { label: model.currencyLabel, value: model.currency },
      { label: model.ownershipLabel, value: model.ownership },
      ...model.assumptions,
    ]
      .map(rowHtml)
      .join('')}</table></section>
    <section><h2>${escapeHtml(model.breakdownTitle)}</h2><table>${model.breakdown.map(rowHtml).join('')}</table></section>
    ${model.financing?.length ? `<section class="avoid-break"><h2>${escapeHtml(model.financingTitle)}</h2><table>${model.financing.map(rowHtml).join('')}</table></section>` : ''}
    <section class="avoid-break"><h2>${escapeHtml(model.scenariosTitle)}</h2><table>${model.scenarios.map(rowHtml).join('')}</table></section>
    <section class="avoid-break"><h2>${escapeHtml(model.legalTitle)}</h2><p>${escapeHtml(model.legalDisclaimer)}</p></section>
    <footer>${escapeHtml(model.appVersionLabel)} ${escapeHtml(model.appVersion)} · ${escapeHtml(model.engineVersionLabel)} ${escapeHtml(model.engineVersion)}</footer>
  </body></html>`;
}

export function buildComparisonReportHtml(model: ComparisonReportViewModel): string {
  const header = `<tr>${Object.values(model.headers)
    .map((value) => `<th>${escapeHtml(value)}</th>`)
    .join('')}</tr>`;
  const rows = model.projects
    .map(
      (project) =>
        `<tr><td>${escapeHtml(project.title)}</td><td>${escapeHtml(project.currency)}</td><td>${escapeHtml(project.ownership)}</td><td>${escapeHtml(project.total)}</td><td>${escapeHtml(project.monthly)}</td><td>${escapeHtml(project.usage)}</td></tr>`,
    )
    .join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyles} table.comparison th { width: auto; }</style></head><body>
    <header><h1>${escapeHtml(model.documentTitle)}</h1><div class="subtitle">${escapeHtml(model.generatedAtLabel)}</div></header>
    <section><h2>${escapeHtml(model.documentTitle)}</h2><table class="comparison">${header}${rows}</table></section>
    ${model.warnings.length ? `<section class="avoid-break"><h2>${escapeHtml(model.warningsTitle)}</h2><ul>${model.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul></section>` : ''}
    <section class="avoid-break"><h2>${escapeHtml(model.legalTitle)}</h2><p>${escapeHtml(model.legalDisclaimer)}</p></section>
    <footer>${escapeHtml(model.engineVersionLabel)} ${escapeHtml(model.engineVersion)}</footer>
  </body></html>`;
}

export function buildResultCardHtml(model: ResultCardViewModel): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyles} @page { size: 420px 560px; margin: 20px; } body { background: #f5f7f8; } .card { background: white; border: 1px solid #d5dee2; border-radius: 20px; padding: 28px; } .brand { color: #087e72; font-size: 18px; font-weight: 700; } .total { font-size: 32px; font-weight: 700; margin: 8px 0 20px; } .row { border-top: 1px solid #e9eef1; display: flex; justify-content: space-between; padding: 12px 0; }</style></head><body><main class="card">
    <div class="brand">${escapeHtml(model.brand)}</div><h1>${escapeHtml(model.projectTitle)}</h1>
    <div>${escapeHtml(model.totalLabel)}</div><div class="total">${escapeHtml(model.total)}</div>
    <div class="row"><span>${escapeHtml(model.monthlyLabel)}</span><strong>${escapeHtml(model.monthly)}</strong></div>
    <div class="row"><span>${escapeHtml(model.usageLabel)}</span><strong>${escapeHtml(model.usage)}</strong></div>
    <div class="row"><span>${escapeHtml(model.completenessLabel)}</span><strong>${escapeHtml(model.completeness)}</strong></div>
    <footer>${escapeHtml(model.disclaimer)}</footer>
  </main></body></html>`;
}
