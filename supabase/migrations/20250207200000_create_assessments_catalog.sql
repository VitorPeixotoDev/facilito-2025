-- Catálogo de avaliações (antes hardcoded em assessmentsConfig.ts)
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    description TEXT NOT NULL,
    estimated_time TEXT NOT NULL,
    question_count INT NOT NULL CHECK (question_count > 0),
    category TEXT NOT NULL DEFAULT 'avaliacoes',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questões de cada avaliação (antes hardcoded nos componentes)
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    sort_order INT NOT NULL,
    text TEXT NOT NULL,
    factor TEXT NOT NULL,
    reverse_score BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(assessment_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);

-- Opções de escala (1-5 etc.) por avaliação
CREATE TABLE IF NOT EXISTS assessment_scale_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    value INT NOT NULL,
    label TEXT NOT NULL,
    emoji TEXT,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    UNIQUE(assessment_id, value)
);

CREATE INDEX IF NOT EXISTS idx_assessment_scale_options_assessment_id ON assessment_scale_options(assessment_id);

-- RLS: leitura pública para catálogo e questões (loja e questionário)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_scale_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assessments"
    ON assessments FOR SELECT USING (true);
CREATE POLICY "Anyone can read assessment_questions"
    ON assessment_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can read assessment_scale_options"
    ON assessment_scale_options FOR SELECT USING (true);

-- Inserir avaliações
INSERT INTO assessments (id, name, image, description, estimated_time, question_count, category) VALUES
    ('five-mind', 'FiveMind', '/blue_head_lito.png', 'Teste de Fit Cultural.', '5-7 minutos', 20, 'avaliacoes'),
    ('hexa-mind', 'HexaMind', '/orange_head_lito.png', 'Teste de 6 Fatores de Personalidade para fit profissional.', '10 minutos', 40, 'avaliacoes')
ON CONFLICT (id) DO NOTHING;
