CREATE TYPE public.plan_duration AS ENUM ('recorrencia','trimestral','semestral','anual');

CREATE TABLE public.system_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  max_alunos_ativos integer NOT NULL DEFAULT 100 CHECK (max_alunos_ativos >= 0),
  valor numeric NOT NULL DEFAULT 0 CHECK (valor >= 0),
  duracao public.plan_duration NOT NULL DEFAULT 'recorrencia',
  permissoes text[] NOT NULL DEFAULT ARRAY['dashboard','configuracoes']::text[],
  destaque boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_plan TO authenticated;
GRANT ALL ON public.system_plan TO service_role;
ALTER TABLE public.system_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_plan read" ON public.system_plan FOR SELECT TO authenticated USING (true);
CREATE POLICY "system_plan insert super" ON public.system_plan FOR INSERT TO authenticated WITH CHECK (public.is_super_admin());
CREATE POLICY "system_plan update super" ON public.system_plan FOR UPDATE TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "system_plan delete super" ON public.system_plan FOR DELETE TO authenticated USING (public.is_super_admin());
CREATE TRIGGER system_plan_updated_at BEFORE UPDATE ON public.system_plan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.academy ADD COLUMN system_plan_id uuid REFERENCES public.system_plan(id);

INSERT INTO public.system_plan (nome, descricao, max_alunos_ativos, valor, duracao, permissoes, destaque)
VALUES
 ('Starter','Plano inicial',100,97,'recorrencia',ARRAY['dashboard','alunos','planos','agenda','checkins','financeiro','relatorios','leads','aigrowth','equipe','configuracoes'],false),
 ('Pro','Plano profissional',300,197,'recorrencia',ARRAY['dashboard','alunos','planos','agenda','checkins','financeiro','relatorios','leads','aigrowth','equipe','configuracoes'],true),
 ('Premium','Plano completo',1000,397,'recorrencia',ARRAY['dashboard','alunos','planos','agenda','checkins','financeiro','relatorios','leads','aigrowth','equipe','configuracoes'],false);

UPDATE public.academy a SET system_plan_id = sp.id FROM public.system_plan sp
WHERE a.system_plan_id IS NULL AND lower(sp.nome) = a.plano::text;

COMMENT ON COLUMN public.academy.plano IS 'DEPRECATED: replaced by system_plan_id';

CREATE OR REPLACE FUNCTION public.enforce_student_plan_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_max integer; v_count integer;
BEGIN
  IF NEW.status <> 'active' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'active' AND OLD.academy_id = NEW.academy_id THEN RETURN NEW; END IF;
  IF public.is_super_admin() THEN RETURN NEW; END IF;
  SELECT sp.max_alunos_ativos INTO v_max FROM public.academy a JOIN public.system_plan sp ON sp.id = a.system_plan_id WHERE a.id = NEW.academy_id;
  IF v_max IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO v_count FROM public.student WHERE academy_id = NEW.academy_id AND status = 'active' AND id <> NEW.id;
  IF v_count >= v_max THEN
    RAISE EXCEPTION 'Limite de % alunos ativos do plano atingido', v_max;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER student_plan_limit BEFORE INSERT OR UPDATE OF status, academy_id ON public.student
FOR EACH ROW EXECUTE FUNCTION public.enforce_student_plan_limit();