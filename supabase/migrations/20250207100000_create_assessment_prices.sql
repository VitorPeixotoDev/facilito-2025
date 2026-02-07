-- Preço por avaliação (centavos). Permite preços diferentes por teste.
CREATE TABLE IF NOT EXISTS assessment_prices (
    assessment_id TEXT PRIMARY KEY,
    price_cents INTEGER NOT NULL CHECK (price_cents > 0),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir preço padrão para as avaliações existentes (R$ 20,00)
INSERT INTO assessment_prices (assessment_id, price_cents)
VALUES
    ('five-mind', 2000),
    ('hexa-mind', 2000)
ON CONFLICT (assessment_id) DO NOTHING;

-- RLS: leitura pública (preços são exibidos na loja), escrita apenas via service role / backend
ALTER TABLE assessment_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assessment prices"
    ON assessment_prices FOR SELECT
    USING (true);
