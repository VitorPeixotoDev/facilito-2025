-- Cole este script no SQL Editor do Supabase e execute (Run).
-- Cria assessment_purchases e assessment_prices.

-- 1) Tabela de compras
CREATE TABLE IF NOT EXISTS assessment_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id TEXT NOT NULL,
    stripe_session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, assessment_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_purchases_user_id ON assessment_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_purchases_stripe_session ON assessment_purchases(stripe_session_id);

ALTER TABLE assessment_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchases"
    ON assessment_purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
    ON assessment_purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 2) Tabela de preços
CREATE TABLE IF NOT EXISTS assessment_prices (
    assessment_id TEXT PRIMARY KEY,
    price_cents INTEGER NOT NULL CHECK (price_cents > 0),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO assessment_prices (assessment_id, price_cents)
VALUES
    ('five-mind', 2000),
    ('hexa-mind', 2000)
ON CONFLICT (assessment_id) DO NOTHING;

ALTER TABLE assessment_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read assessment prices"
    ON assessment_prices FOR SELECT
    USING (true);
