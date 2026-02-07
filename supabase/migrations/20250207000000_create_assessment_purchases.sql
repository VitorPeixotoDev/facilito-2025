-- Tabela para registrar compras de avaliações (pagamento via Stripe)
CREATE TABLE IF NOT EXISTS assessment_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_id TEXT NOT NULL,
    stripe_session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, assessment_id)
);

-- Índices para consultas por usuário e por sessão Stripe
CREATE INDEX IF NOT EXISTS idx_assessment_purchases_user_id ON assessment_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_purchases_stripe_session ON assessment_purchases(stripe_session_id);

-- RLS: usuário só pode ver/inserir seus próprios registros (inserção via service role no backend)
ALTER TABLE assessment_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchases"
    ON assessment_purchases FOR SELECT
    USING (auth.uid() = user_id);

-- Inserção só pelo backend (service role) ou permitir insert do próprio user ao verificar sessão
CREATE POLICY "Users can insert own purchases"
    ON assessment_purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);
