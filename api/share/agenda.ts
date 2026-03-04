import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
    const { eventId } = req.query;

    if (!eventId) {
        return res.redirect('/agenda');
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.redirect(`/inscricoes?eventId=${eventId}`);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: event, error } = await supabase
        .from('events')
        .select('title, start_at, location, description')
        .eq('id', eventId)
        .single();

    if (error || !event) {
        return res.redirect('/agenda');
    }

    const date = new Date(event.start_at).toLocaleString('pt-BR');
    const title = `${event.title} | Agenda SEMEAR`;
    const description = `${date} em ${event.location || 'Local a definir'}. ${event.description || ''}`.slice(0, 160);
    const image = 'https://semear-pwa.vercel.app/icons/icon-512.png';
    const url = `https://semear-pwa.vercel.app/inscricoes?eventId=${eventId}`;

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
  <meta http-equiv="refresh" content="0; url=/inscricoes?eventId=${eventId}">
</head>
<body>
  <p>Redirecionando para as inscrições...</p>
</body>
</html>
  `.trim();

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
}
