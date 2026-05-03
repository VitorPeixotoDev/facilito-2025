-- Migra public.users.experience de text para jsonb.
-- Texto existente vira um único bloco com descrição preenchida (empresa/cargo/datas vazios).
-- Execute uma vez no ambiente Supabase/Postgres após backup.

ALTER TABLE public.users
  ALTER COLUMN experience TYPE jsonb USING (
    CASE
      WHEN experience IS NULL THEN NULL::jsonb
      WHEN trim(experience::text) = '' THEN NULL::jsonb
      ELSE jsonb_build_array(
        jsonb_build_object(
          'company', '',
          'role', '',
          'description', experience::text,
          'start_date', NULL::jsonb,
          'end_date', NULL::jsonb
        )
      )
    END
  );

COMMENT ON COLUMN public.users.experience IS 'Experiências profissionais: jsonb array de { id?, company, role, description, start_date, end_date }';
