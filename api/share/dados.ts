import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
    const { station_code } = req.query;

    if (!station_code) {
        return res.redirect('/dados');
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.redirect(`/dados?station=${station_code}`);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch station and latest measurement
    const { data: station, error: sError } = await supabase
        .from('stations')
        .select('id, name')
        .eq('code', station_code)
        .single();

    if (sError || !station) {
        return res.redirect('/dados');
    }

    const { data: measurement, error: mError } = await supabase
        .from('measurements')
        .select('pm25, pm10, ts')
        .eq('station_id', station.id)
        .order('ts', { ascending: false })
        .limit(1)
        .maybeSingle();

    const title = `Qualidade do ar agora: ${station.name}`;
    let description = 'Veja os dados de monitoramento ambiental em tempo real.';

    if (measurement) {
        const pm25 = measurement.pm25 !== null ? `${measurement.pm25} µg/m³` : 'N/A';
        description = `Última medição: PM2.5: ${pm25}. Clique para ver o painel completo.`;
    }

    const image = 'https://semear-pwa.vercel.app/icons/icon-512.png';
    const url = `https://semear-pwa.vercel.app/dados?station=${station_code}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${url}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${image}">

  <!-- Redirect -->
  <meta http-equiv="refresh" content="0; url=/dados?station=${station_code}">
</head>
<body>
  <p>Redirecionando para o painel de dados...</p>
</body>
</html>
  `.trim();

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
}
