ALTER TABLE public.system_plan ADD COLUMN max_equipe_ativos integer NOT NULL DEFAULT 10 CHECK (max_equipe_ativos >= 0);
UPDATE public.system_plan SET max_equipe_ativos = CASE lower(nome) WHEN 'starter' THEN 5 WHEN 'pro' THEN 15 WHEN 'premium' THEN 50 ELSE max_equipe_ativos END WHERE lower(nome) IN ('starter','pro','premium');

CREATE OR REPLACE FUNCTION public.enforce_team_plan_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_max integer; v_count integer;
BEGIN
  IF NOT NEW.active THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.active AND OLD.academy_id = NEW.academy_id THEN RETURN NEW; END IF;
  IF public.is_super_admin() THEN RETURN NEW; END IF;
  SELECT sp.max_equipe_ativos INTO v_max FROM public.academy a JOIN public.system_plan sp ON sp.id = a.system_plan_id WHERE a.id = NEW.academy_id;
  IF v_max IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO v_count FROM public.team_member WHERE academy_id = NEW.academy_id AND active AND id <> NEW.id;
  IF v_count >= v_max THEN
    RAISE EXCEPTION 'Limite de % colaboradores ativos da equipe do plano atingido', v_max;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER team_plan_limit BEFORE INSERT OR UPDATE OF active, academy_id ON public.team_member
FOR EACH ROW EXECUTE FUNCTION public.enforce_team_plan_limit();