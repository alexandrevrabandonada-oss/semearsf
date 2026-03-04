-- Migration: Blog da Emenda
-- Tables for blog posts and editors

-- 1. blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content_md text,
  cover_url text,
  tags text[] DEFAULT '{}',
  published_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now()
);

-- 2. blog_editors
CREATE TABLE IF NOT EXISTS public.blog_editors (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz DEFAULT now()
);

-- 3. RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_editors ENABLE ROW LEVEL SECURITY;

-- blog_posts: SELECT público somente para publicados
CREATE POLICY "blog_posts_select_public" ON public.blog_posts
  FOR SELECT USING (status = 'published');

-- blog_posts: INSERT/UPDATE/DELETE apenas para editores
CREATE POLICY "blog_posts_all_editors" ON public.blog_posts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.blog_editors WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.blog_editors WHERE user_id = auth.uid()));

-- blog_editors: Fechado (apenas service role/postgres podem gerenciar via API direto ou painel)
-- Por padrão, sem políticas adicionais, apenas superuser/service_role tem acesso livre.

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts (published_at DESC) WHERE (status = 'published');
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON public.blog_posts USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts (status);
