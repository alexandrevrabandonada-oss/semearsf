import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  const { slug } = req.query;

  if (!slug) {
    return res.redirect('/');
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.redirect(`/corredores/${slug}`);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // --- Share Analytics (Privacy-Safe) ---
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
    const salt = process.env.SHARE_HASH_SALT || 'default-salt-change-me';

    const crypto = await import('node:crypto');
    const ipHash = crypto.createHash('sha256').update(`${ip}${salt}`).digest('hex');

    await supabase.from('share_events').insert({
      kind: 'corredores',
      slug,
      referrer: req.headers['referer'] || null,
      user_agent: req.headers['user-agent'] || null,
      ip_hash: ipHash
    });
  } catch (err) {
    console.error('[ShareAnalytics] Failed to log event:', err);
  }

  const { data: corridor, error } = await supabase
    .from('climate_corridors')
    .select('title, excerpt, cover_url, created_at')
    .eq('slug', slug)
    .single();

  if (error || !corridor) {
    return res.redirect(`/corredores/${slug}`);
  }

  const hostUrl = req.headers.host ? `https://${req.headers.host}` : 'https://semear-pwa.vercel.app';
  const title = `${corridor.title} | Corredores Climáticos SEMEAR`;
  const description = corridor.excerpt || 'Explore este corredor climático monitorado pelo SEMEAR.';

  const safeTitle = encodeURIComponent(corridor.title);
  const safeSubtitle = encodeURIComponent(corridor.excerpt || 'Corredor Climático');

  const image = corridor.cover_url || `${hostUrl}/api/og/card?kind=corredores&title=${safeTitle}&subtitle=${safeSubtitle}`;
  const url = `${hostUrl}/corredores/${slug}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
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
  <meta http-equiv="refresh" content="0; url=/corredores/${slug}">
</head>
<body>
  <p>Redirecionando para o corredor climático...</p>
</body>
</html>
  `.trim();

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
