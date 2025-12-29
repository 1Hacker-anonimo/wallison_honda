-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SUPABASE SCHEMA - HONDA PROJECT
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. PROFILES (Role Management)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE perfil_vendedor 
ADD COLUMN IF NOT EXISTS header_logo_enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN perfil_vendedor.header_logo_enabled IS 'Controls whether the header logo is displayed on the public site';

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. PERFIL VENDEDOR & SITE CONFIG
CREATE TABLE IF NOT EXISTS public.perfil_vendedor (
  id SMALLINT PRIMARY KEY DEFAULT 1, -- Only one record
  nome TEXT NOT NULL,
  descricao TEXT,
  foto_url TEXT,
  whatsapp TEXT,
  instagram TEXT,
  youtube TEXT,
  header_logo_url TEXT,
  banner_image_url TEXT,
  financing_title TEXT,
  financing_bio TEXT,
  financing_how_it_works TEXT,
  financing_whatsapp TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT single_record CHECK (id = 1)
);

-- Enable RLS on perfil_vendedor
ALTER TABLE public.perfil_vendedor ENABLE ROW LEVEL SECURITY;

-- 3. MOTOS
CREATE TABLE IF NOT EXISTS public.motos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT,
  preco TEXT, -- Keeping as text for easier formatting if desired, or use numeric
  descricao TEXT,
  imagem_url TEXT,
  galeria TEXT[], -- Array of URLs
  video_url TEXT,
  specs TEXT,
  ativo BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  transfer_enabled BOOLEAN DEFAULT false,
  transfer_message TEXT,
  transfer_button_text TEXT,
  transfer_mandatory_fields BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on motos
ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;

-- 4. CONSORCIOS
CREATE TABLE IF NOT EXISTS public.consorcios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moto_id UUID REFERENCES public.motos(id) ON DELETE CASCADE,
  credito TEXT,
  texto_info TEXT,
  whatsapp_especifico TEXT,
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on consorcios
ALTER TABLE public.consorcios ENABLE ROW LEVEL SECURITY;

-- 5. PLANOS CONSORCIO
CREATE TABLE IF NOT EXISTS public.planos_consorcio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consorcio_id UUID REFERENCES public.consorcios(id) ON DELETE CASCADE,
  parcelas INTEGER NOT NULL,
  valor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on planos_consorcio
ALTER TABLE public.planos_consorcio ENABLE ROW LEVEL SECURITY;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- POLICIES (RLS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Policies for public reading (Public can see everything)
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public can view perfil_vendedor" ON public.perfil_vendedor FOR SELECT USING (true);
CREATE POLICY "Public can view motos" ON public.motos FOR SELECT USING (ativo = true);
CREATE POLICY "Public can view consorcios" ON public.consorcios FOR SELECT USING (true);
CREATE POLICY "Public can view planos_consorcio" ON public.planos_consorcio FOR SELECT USING (true);

-- Policies for Admin (Write access)
-- Note: Requires a custom check for role = 'admin'

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Only admin can insert/update other profiles
CREATE POLICY "Admin can service all profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Perfil Vendedor: Only admin can update
CREATE POLICY "Admin can update perfil" ON public.perfil_vendedor FOR ALL USING (public.is_admin());

-- Motos: Only admin can insert/update/delete
CREATE POLICY "Admin can manage motos" ON public.motos FOR ALL USING (public.is_admin());

-- Consorcios: Only admin can insert/update/delete
CREATE POLICY "Admin can manage consorcios" ON public.consorcios FOR ALL USING (public.is_admin());

-- Planos Consorcio: Only admin can insert/update/delete
CREATE POLICY "Admin can manage planos" ON public.planos_consorcio FOR ALL USING (public.is_admin());

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STORAGE BUCKETS (Needs to be done via UI or API, but here are the names)
-- Buckets: profile_images, moto_images, banners, extras
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
