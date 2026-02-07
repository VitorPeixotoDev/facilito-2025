-- Trocar id das avaliações de TEXT (five-mind, hexa-mind) para UUID.
-- Mantém slug (five-mind, hexa-mind) para uso interno na aplicação.

-- UUIDs fixos para as duas avaliações existentes (reproduzíveis)
-- five-mind: 550e8400-e29b-41d4-a716-446655440001
-- hexa-mind: 550e8400-e29b-41d4-a716-446655440002

-- 1) Assessments: adicionar slug e id novo (UUID)
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS id_uuid UUID;

-- Definir slug a partir de id (id pode ser TEXT 'five-mind'/'hexa-mind' ou já UUID em re-execução)
UPDATE assessments SET slug = CASE id::text
    WHEN 'five-mind' THEN 'five-mind'
    WHEN 'hexa-mind' THEN 'hexa-mind'
    WHEN '550e8400-e29b-41d4-a716-446655440001' THEN 'five-mind'
    WHEN '550e8400-e29b-41d4-a716-446655440002' THEN 'hexa-mind'
    ELSE COALESCE(slug, id::text)
END WHERE slug IS NULL OR slug ~ '^[0-9a-f-]{36}$';

-- Preencher id_uuid por slug (nunca comparar id com 'five-mind' pois id pode já ser UUID)
UPDATE assessments SET id_uuid = '550e8400-e29b-41d4-a716-446655440001'::uuid WHERE slug = 'five-mind';
UPDATE assessments SET id_uuid = '550e8400-e29b-41d4-a716-446655440002'::uuid WHERE slug = 'hexa-mind';

ALTER TABLE assessments ALTER COLUMN slug SET NOT NULL;

-- 2) assessment_prices: migrar para UUID
ALTER TABLE assessment_prices ADD COLUMN IF NOT EXISTS assessment_uuid UUID;
UPDATE assessment_prices SET assessment_uuid = a.id_uuid FROM assessments a
WHERE a.slug = assessment_prices.assessment_id::text
   OR (assessment_prices.assessment_id::text ~ '^[0-9a-f-]{36}$' AND a.id_uuid = assessment_prices.assessment_id);
ALTER TABLE assessment_prices DROP CONSTRAINT IF EXISTS assessment_prices_pkey;
ALTER TABLE assessment_prices DROP COLUMN IF EXISTS assessment_id;
ALTER TABLE assessment_prices RENAME COLUMN assessment_uuid TO assessment_id;
ALTER TABLE assessment_prices ADD PRIMARY KEY (assessment_id);

-- 3) assessment_purchases: migrar para UUID
ALTER TABLE assessment_purchases ADD COLUMN IF NOT EXISTS assessment_uuid UUID;
UPDATE assessment_purchases SET assessment_uuid = a.id_uuid FROM assessments a
WHERE a.slug = assessment_purchases.assessment_id::text
   OR (assessment_purchases.assessment_id::text ~ '^[0-9a-f-]{36}$' AND a.id_uuid = assessment_purchases.assessment_id);
ALTER TABLE assessment_purchases DROP COLUMN IF EXISTS assessment_id;
ALTER TABLE assessment_purchases RENAME COLUMN assessment_uuid TO assessment_id;
ALTER TABLE assessment_purchases ADD CONSTRAINT assessment_purchases_user_assessment_unique UNIQUE (user_id, assessment_id);

-- 4) assessment_questions: migrar para UUID
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS assessment_uuid UUID;
UPDATE assessment_questions SET assessment_uuid = a.id_uuid FROM assessments a
WHERE a.slug = assessment_questions.assessment_id::text
   OR (assessment_questions.assessment_id::text ~ '^[0-9a-f-]{36}$' AND a.id_uuid = assessment_questions.assessment_id);
ALTER TABLE assessment_questions DROP CONSTRAINT IF EXISTS assessment_questions_assessment_id_sort_order_key;
ALTER TABLE assessment_questions DROP COLUMN IF EXISTS assessment_id;
ALTER TABLE assessment_questions RENAME COLUMN assessment_uuid TO assessment_id;
ALTER TABLE assessment_questions ADD CONSTRAINT assessment_questions_assessment_id_sort_order_key UNIQUE (assessment_id, sort_order);

-- 5) assessment_scale_options: migrar para UUID
ALTER TABLE assessment_scale_options ADD COLUMN IF NOT EXISTS assessment_uuid UUID;
UPDATE assessment_scale_options SET assessment_uuid = a.id_uuid FROM assessments a
WHERE a.slug = assessment_scale_options.assessment_id::text
   OR (assessment_scale_options.assessment_id::text ~ '^[0-9a-f-]{36}$' AND a.id_uuid = assessment_scale_options.assessment_id);
ALTER TABLE assessment_scale_options DROP CONSTRAINT IF EXISTS assessment_scale_options_assessment_id_value_key;
ALTER TABLE assessment_scale_options DROP COLUMN IF EXISTS assessment_id;
ALTER TABLE assessment_scale_options RENAME COLUMN assessment_uuid TO assessment_id;
ALTER TABLE assessment_scale_options ADD CONSTRAINT assessment_scale_options_assessment_id_value_key UNIQUE (assessment_id, value);

-- 6) Remover FKs que apontam para assessments(id) antes de trocar a PK
ALTER TABLE assessment_questions DROP CONSTRAINT IF EXISTS assessment_questions_assessment_id_fkey;
ALTER TABLE assessment_scale_options DROP CONSTRAINT IF EXISTS assessment_scale_options_assessment_id_fkey;

-- 7) assessments: trocar PK de id (TEXT) para id (UUID)
ALTER TABLE assessments DROP CONSTRAINT IF EXISTS assessments_pkey;
ALTER TABLE assessments DROP COLUMN IF EXISTS id;
ALTER TABLE assessments RENAME COLUMN id_uuid TO id;
ALTER TABLE assessments ADD PRIMARY KEY (id);
ALTER TABLE assessments DROP CONSTRAINT IF EXISTS assessments_slug_unique;
ALTER TABLE assessments ADD CONSTRAINT assessments_slug_unique UNIQUE (slug);

-- 8) Recrear FKs das tabelas filhas para assessments(id)
ALTER TABLE assessment_prices   DROP CONSTRAINT IF EXISTS assessment_prices_assessment_id_fkey;
ALTER TABLE assessment_prices   ADD CONSTRAINT assessment_prices_assessment_id_fkey   FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;
ALTER TABLE assessment_questions DROP CONSTRAINT IF EXISTS assessment_questions_assessment_id_fkey;
ALTER TABLE assessment_questions ADD CONSTRAINT assessment_questions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;
ALTER TABLE assessment_scale_options DROP CONSTRAINT IF EXISTS assessment_scale_options_assessment_id_fkey;
ALTER TABLE assessment_scale_options ADD CONSTRAINT assessment_scale_options_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE;

-- Reinserir preços se a migração tiver zerado (por segurança)
INSERT INTO assessment_prices (assessment_id, price_cents)
SELECT id, 2000 FROM assessments
ON CONFLICT (assessment_id) DO NOTHING;
