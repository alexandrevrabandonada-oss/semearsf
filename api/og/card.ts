export default function handler(req: any, res: any) {
    const { kind = 'SEMEAR', title = '', subtitle = '', footer = '', pm25, pm10, time } = req.query;

    const safeTitle = String(title).substring(0, 100).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeSubtitle = String(subtitle).substring(0, 150).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeKind = String(kind).substring(0, 30).toUpperCase().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeFooter = footer ? String(footer).substring(0, 80).toUpperCase().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : 'SEMEAR • UFF • EMENDA PARLAMENTAR';

    let contentBlock = `
    <!-- Title and Subtitle Block -->
    <foreignObject x="80" y="190" width="1040" height="300">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, sans-serif; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 64px; font-weight: 900; color: #E2E8F0; line-height: 1.1; margin-bottom: 24px;">
                ${safeTitle}
            </div>
            ${safeSubtitle ? `
            <div style="font-size: 32px; font-weight: normal; color: #94A3B8; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                ${safeSubtitle}
            </div>
            ` : ''}
        </div>
    </foreignObject>
    `;

    if (safeKind === 'DADOS' && pm25 && pm10 && time) {
        const safePm25 = String(pm25).replace(/</g, '&lt;');
        const safePm10 = String(pm10).replace(/</g, '&lt;');
        const safeTime = String(time).replace(/</g, '&lt;');

        contentBlock = `
    <foreignObject x="80" y="190" width="1040" height="300">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, sans-serif; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 64px; font-weight: 900; color: #E2E8F0; line-height: 1.1; margin-bottom: 32px;">
                ${safeTitle}
            </div>
            <div style="display: flex; gap: 48px; border-left: 6px solid #22D3EE; padding-left: 24px; margin-bottom: 24px;">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 24px; color: #94A3B8; text-transform: uppercase; font-weight: 800; letter-spacing: 2px;">PM2.5</span>
                    <span style="font-size: 56px; font-weight: 900; color: #10B981;">${safePm25} <span style="font-size: 24px; color: #64748B;">µg/m³</span></span>
                </div>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 24px; color: #94A3B8; text-transform: uppercase; font-weight: 800; letter-spacing: 2px;">PM10</span>
                    <span style="font-size: 56px; font-weight: 900; color: #F59E0B;">${safePm10} <span style="font-size: 24px; color: #64748B;">µg/m³</span></span>
                </div>
            </div>
            <div style="font-size: 24px; font-weight: bold; color: #64748B;">
                Atualizado: ${safeTime}
            </div>
        </div>
    </foreignObject>
        `;
    }

    const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <radialGradient id="grad" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stop-color="#111827" />
            <stop offset="100%" stop-color="#0B1015" />
        </radialGradient>
    </defs>
    
    <rect width="1200" height="630" fill="url(#grad)" />
    <rect width="1200" height="8" fill="#22D3EE" />
    
    <g transform="translate(80, 140)">
        <text x="0" y="0" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#22D3EE" letter-spacing="4">${safeKind}</text>
    </g>
    
${contentBlock}

    <g transform="translate(80, 560)">
        <text x="0" y="0" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#64748B" letter-spacing="2">${safeFooter}</text>
    </g>
</svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.status(200).send(svg);
}
