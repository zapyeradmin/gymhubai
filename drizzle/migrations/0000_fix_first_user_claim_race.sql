-- Cleanup duplicates left by the concurrent claim race
DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.user_id = b.user_id
  AND a.role = b.role
  AND COALESCE(a.academy_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.academy_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND (a.created_at > b.created_at OR (a.created_at = b.created_at AND a.id > b.id));

DELETE FROM public.app_config a
USING public.app_config b
WHERE a.created_at > b.created_at OR (a.created_at = b.created_at AND a.id > b.id);

-- app_config is a singleton: enforce a single row
CREATE UNIQUE INDEX IF NOT EXISTS app_config_singleton_idx ON public.app_config ((true));

-- Unique constraint must treat NULL academy_id as equal (NULLs are distinct by default)
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_academy_id_key;
CREATE UNIQUE INDEX user_roles_user_role_academy_key
  ON public.user_roles (user_id, role, COALESCE(academy_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Race-safe first-user claim: lock the config row so concurrent calls cannot both claim
CREATE OR REPLACE FUNCTION public.claim_super_admin_if_empty()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_email text;
  v_existing text[];
BEGIN
  v_email := lower(coalesce((auth.jwt() ->> 'email')::text, ''));
  IF v_email = '' OR auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.app_config (app_name) VALUES ('GymBoss AI')
  ON CONFLICT ((true)) DO NOTHING;

  SELECT super_admin_emails INTO v_existing FROM public.app_config FOR UPDATE LIMIT 1;

  IF v_existing IS NULL OR array_length(v_existing, 1) IS NULL THEN
    UPDATE public.app_config SET super_admin_emails = ARRAY[v_email], updated_at = now();
  ELSE
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'super_admin')
  ON CONFLICT (user_id, role, COALESCE(academy_id, '00000000-0000-0000-0000-000000000000'::uuid))
  DO NOTHING;

  RETURN true;
END;
$function$;