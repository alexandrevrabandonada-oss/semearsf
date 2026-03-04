import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
    const { slug } = req.query;

    if (!slug) {
        return res.redirect('/');
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.redirect(`/blog/${slug}`);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('title, excerpt, cover_url')
        .eq('slug', slug)
        .single();

    if (error || !post) {
        return res.redirect(`/blog/${slug}`);
    }

    const title = `${post.title} | Blog SEMEAR`;
    const description = post.excerpt || 'Leia este artigo no Blog SEMEAR.';
    const image = post.cover_url || 'https://semear-pwa.vercel.app/icons/icon-512.png';
    const url = `https://semear-pwa.vercel.app/blog/${slug}`;

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
  <meta http-equiv="refresh" content="0; url=/blog/${slug}">
</head>
<body>
  <p>Redirecionando para o blog...</p>
</body>
</html>
  `.trim();

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
}
