CREATE TYPE public.business_type AS ENUM ('academia','estudio_personal','estudio_funcional','estudio_pilates','artes_marciais','box_crossfit');
ALTER TABLE public.academy
  ADD COLUMN tipo_empresa public.business_type NOT NULL DEFAULT 'academia',
  ADD COLUMN razao_social text,
  ADD COLUMN documento_tipo text DEFAULT 'cnpj',
  ADD COLUMN documento text,
  ADD COLUMN inscricao_estadual text,
  ADD COLUMN inscricao_municipal text,
  ADD COLUMN whatsapp text,
  ADD COLUMN site text,
  ADD COLUMN instagram text,
  ADD COLUMN owner_cpf text;
UPDATE public.academy SET documento = cnpj WHERE cnpj IS NOT NULL AND documento IS NULL;

CREATE TABLE public.academy_technical_responsible (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id uuid NOT NULL REFERENCES public.academy(id) ON DELETE CASCADE,
  nome text NOT NULL,
  conselho text NOT NULL DEFAULT 'CREF' CHECK (conselho IN ('CREF','CREFITO')),
  numero_registro text NOT NULL,
  uf text,
  principal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academy_technical_responsible TO authenticated;
GRANT ALL ON public.academy_technical_responsible TO service_role;
ALTER TABLE public.academy_technical_responsible ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view rt" ON public.academy_technical_responsible FOR SELECT TO authenticated
  USING (public.is_admin() OR academy_id IN (SELECT public.user_academy_ids()));
CREATE POLICY "insert rt" ON public.academy_technical_responsible FOR INSERT TO authenticated
  WITH CHECK (public.user_can_manage_academy(academy_id));
CREATE POLICY "update rt" ON public.academy_technical_responsible FOR UPDATE TO authenticated
  USING (public.user_can_manage_academy(academy_id)) WITH CHECK (public.user_can_manage_academy(academy_id));
CREATE POLICY "delete rt" ON public.academy_technical_responsible FOR DELETE TO authenticated
  USING (public.user_can_manage_academy(academy_id));
CREATE TRIGGER rt_updated_at BEFORE UPDATE ON public.academy_technical_responsible
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();